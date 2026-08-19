import { spawn, ChildProcess } from "child_process";
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from "fs";
import { join, dirname } from "path";
import { EventEmitter } from "events";

export type RunStatus = "idle" | "running" | "passed" | "failed";

export type FailureEvidence = {
  type: "console_error" | "http_error_response" | "network_error";
  excerpt: string;
  step?: string;
  url?: string;
  status_code?: number;
};

export type BugVerdict = {
  confirmed: boolean;
  bug_title: string;
  family: string;
  category: string;
  severity: string;
  confidence: number;
  one_liner: string;
  root_cause: string;
  suggestion: string;
  signals: FailureEvidence[];
};

export type RunResult = {
  status: RunStatus;
  overallStatus: "passed" | "failed";
  duration: number;
  creditsConsumed: number;
  sessionId: string;
  shareUrl?: string;
  evidencePath?: string;
  bugVerdict?: BugVerdict;
  steps: StepResult[];
  timestamp: string;
  testFile: string;
};

export type StepResult = {
  index: number;
  heading: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
};

export type ProgressEvent = {
  type: string;
  step?: number;
  status?: string;
  detail?: string;
  timestamp: string;
};

const KANE_CLI_PATH =
  process.env.KANE_CLI_PATH ?? "C:\\Users\\LOYAL\\AppData\\Roaming\\npm\\kane-cli.cmd";

const PROJECT_ROOT = join(dirname(__dirname), "..", "..");

export class KaneWatcher extends EventEmitter {
  private process: ChildProcess | null = null;
  private currentResult: RunResult | null = null;
  private progress: ProgressEvent[] = [];
  private testFile: string;
  private appUrl: string;
  private headless: boolean;
  private fresh: boolean;

  constructor(opts: {
    testFile?: string;
    appUrl?: string;
    headless?: boolean;
    fresh?: boolean;
  } = {}) {
    super();
    this.testFile = opts.testFile ?? "kane-tests/checkout_flow_test.md";
    this.appUrl = opts.appUrl ?? "http://localhost:3000";
    this.headless = opts.headless ?? true;
    this.fresh = opts.fresh ?? false;
  }

  get status(): RunStatus {
    if (this.process) return "running";
    if (!this.currentResult) return "idle";
    return this.currentResult.status;
  }

  get result(): RunResult | null {
    return this.currentResult;
  }

  get progressEvents(): ProgressEvent[] {
    return this.progress;
  }

  async run(): Promise<RunResult> {
    if (this.process) {
      throw new Error("A run is already in progress");
    }

    this.progress = [];
    const testPath = join(PROJECT_ROOT, this.testFile);

    if (!existsSync(testPath)) {
      throw new Error(`Test file not found: ${testPath}`);
    }

    // Update the test file's app_url variable
    this.updateTestUrl(testPath, this.appUrl);

    // Only clear cached recordings when --fresh is requested.
    // Replays are free and deterministic; fresh authoring runs
    // cost credits and are non-deterministic (Kane's LLM may
    // or may not catch the breaks on any given run).
    // The committed recordings already capture the red state;
    // replays reproduce it reliably at zero cost.
    if (this.fresh) {
      this.clearOutputDir();
    }

    return new Promise<RunResult>((resolve, reject) => {
      const args = [
        "testmd",
        "run",
        this.testFile,
        "--agent",
        "--headless",
        "--timeout",
        "120",
      ];

      this.emit("status", "running");
      this.process = spawn(KANE_CLI_PATH, args, {
        cwd: PROJECT_ROOT,
        shell: true,
        env: { ...process.env },
      });

      let stdout = "";
      let stderr = "";

      this.process.stdout?.on("data", (data: Buffer) => {
        stdout += data.toString();
        this.parseStream(data.toString());
      });

      this.process.stderr?.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      this.process.on("close", (code: number) => {
        this.process = null;
        const result = this.buildResult(stdout, code);
        this.currentResult = result;
        this.emit("status", result.status);
        this.emit("result", result);
        resolve(result);
      });

      this.process.on("error", (err: Error) => {
        this.process = null;
        this.emit("status", "idle");
        reject(err);
      });
    });
  }

  private parseStream(data: string): void {
    const lines = data.split("\n").filter((l) => l.trim());
    for (const line of lines) {
      try {
        const event = JSON.parse(line);
        const progressEvent: ProgressEvent = {
          type: event.type ?? "unknown",
          step: event.step_index ?? event.index,
          status: event.status,
          detail: event.detail ?? event.summary ?? event.heading,
          timestamp: new Date().toISOString(),
        };
        this.progress.push(progressEvent);
        this.emit("progress", progressEvent);
      } catch {
        // Not JSON, skip
      }
    }
  }

  private buildResult(stdout: string, _exitCode: number): RunResult {
    const lines = stdout.split("\n").filter((l) => l.trim());
    let overallStatus: "passed" | "failed" = "failed";
    let duration = 0;
    let creditsConsumed = 0;
    let sessionId = "";
    let shareUrl: string | undefined;
    let evidencePath: string | undefined;
    let bugVerdict: BugVerdict | undefined;
    const steps: StepResult[] = [];

    for (const line of lines) {
      try {
        const event = JSON.parse(line);
        if (event.type === "test_md_summary") {
          overallStatus = event.overall_status ?? "failed";
          duration = event.duration_s ?? 0;
          if (event.share_url) shareUrl = event.share_url;
        }
        if (event.type === "test_md_step_end") {
          steps.push({
            index: event.step_index,
            heading: event.heading ?? `Step ${event.step_index}`,
            status: event.status ?? "unknown",
            duration: event.duration_s ?? 0,
          });
        }
        if (event.type === "test_md_done") {
          sessionId = event.session_id ?? "";
          if (event.share_url) shareUrl = event.share_url;
        }
        if (event.type === "test_md_bug_verdict") {
          bugVerdict = {
            confirmed: event.confirmed ?? false,
            bug_title: event.bug_title ?? "",
            family: event.family ?? "",
            category: event.category ?? "",
            severity: event.severity ?? "",
            confidence: event.confidence ?? 0,
            one_liner: event.one_liner ?? "",
            root_cause: event.root_cause ?? "",
            suggestion: event.suggestion ?? "",
            signals: (event.signals ?? []).map((s: Record<string, unknown>) => ({
              type: s.kind as FailureEvidence["type"],
              excerpt: s.excerpt as string,
              step: s.step as string,
            })),
          };
        }
        if (event.type === "run_end") {
          creditsConsumed += event.credits_consumed ?? 0;
          if (event.session_dir) {
            evidencePath = event.session_dir;
          }
          // Extract evidence lines from the run_end summary.
          // Kane embeds evidence: lines in the summary field when
          // the run fails with confirmed product bugs.
          if (event.summary && typeof event.summary === "string") {
            const evidenceLines = event.summary.match(/evidence:\s*[^\n]+/g);
            if (evidenceLines && bugVerdict) {
              for (const line of evidenceLines) {
                const cleaned = line.replace(/^evidence:\s*/, "");
                // Only add if not already in signals
                const exists = bugVerdict.signals.some(
                  (s) => s.excerpt === cleaned
                );
                if (!exists) {
                  let type: FailureEvidence["type"] = "console_error";
                  if (cleaned.includes("http_error_response") || cleaned.includes("500")) {
                    type = "http_error_response";
                  } else if (cleaned.includes("network")) {
                    type = "network_error";
                  }
                  bugVerdict.signals.push({
                    type,
                    excerpt: cleaned,
                  });
                }
              }
            }
            // Fill in root_cause and suggestion from the summary
            // if the bug_verdict event didn't include them.
            if (bugVerdict) {
              if (!bugVerdict.root_cause) {
                const causeMatch = event.summary.match(/^([\s\S]+?)(?:\n|evidence:)/);
                if (causeMatch) bugVerdict.root_cause = causeMatch[1].trim();
              }
              if (!bugVerdict.suggestion && event.suggestion) {
                bugVerdict.suggestion = event.suggestion;
              }
            }
          }
        }
      } catch {
        // skip non-JSON lines
      }
    }

    // Extract evidence path from the "evidence:" line
    const evidenceMatch = stdout.match(
      /evidence:\s*view locally with\s+`kane-cli evidence serve\s+(.+)`/
    );
    if (evidenceMatch) {
      evidencePath = evidenceMatch[1].trim();
    }

    const status: RunStatus =
      overallStatus === "passed" ? "passed" : "failed";

    return {
      status,
      overallStatus,
      duration,
      creditsConsumed,
      sessionId,
      shareUrl,
      evidencePath,
      bugVerdict,
      steps,
      timestamp: new Date().toISOString(),
      testFile: this.testFile,
    };
  }

  private updateTestUrl(testPath: string, url: string): void {
    let content = readFileSync(testPath, "utf-8");
    content = content.replace(
      /value:\s*"https?:\/\/[^"]*"/,
      `value: "${url}"`
    );
    writeFileSync(testPath, content, "utf-8");
  }

  private clearOutputDir(): void {
    const testDir = dirname(join(PROJECT_ROOT, this.testFile));
    const entries = existsSync(testDir)
      ? require("fs").readdirSync(testDir)
      : [];
    for (const entry of entries) {
      if (entry.startsWith("output-")) {
        const fullPath = join(testDir, entry);
        try {
          rmSync(fullPath, { recursive: true, force: true });
          this.emit("progress", {
            type: "cache_cleared",
            detail: `Cleared ${entry}`,
            timestamp: new Date().toISOString(),
          });
        } catch {
          // ignore
        }
      }
    }
  }

  generateFailureReport(result: RunResult): string {
    if (result.overallStatus !== "failed" || !result.bugVerdict) {
      return "";
    }

    const bv = result.bugVerdict;
    const lines: string[] = [];

    lines.push("# Kane CLI Failure Report");
    lines.push("");
    lines.push(`**Generated:** ${result.timestamp}`);
    lines.push(`**Test file:** ${result.testFile}`);
    lines.push(`**Session ID:** ${result.sessionId}`);
    lines.push(`**Duration:** ${result.duration}s`);
    lines.push(`**Credits consumed:** ${result.creditsConsumed.toFixed(2)}`);
    lines.push("");

    lines.push("## Bug Verdict");
    lines.push("");
    lines.push(`**Title:** ${bv.bug_title}`);
    lines.push(`**Category:** ${bv.family} / ${bv.category}`);
    lines.push(`**Severity:** ${bv.severity}`);
    lines.push(`**Confidence:** ${(bv.confidence * 100).toFixed(0)}%`);
    lines.push("");
    lines.push(`**Root cause:** ${bv.root_cause}`);
    lines.push("");
    lines.push(`**Suggestion:** ${bv.suggestion}`);
    lines.push("");

    if (bv.signals.length > 0) {
      lines.push("## Evidence");
      lines.push("");
      for (const signal of bv.signals) {
        lines.push(`### ${signal.type}${signal.step ? ` (step ${signal.step})` : ""}`);
        lines.push("```");
        lines.push(signal.excerpt);
        lines.push("```");
        lines.push("");
      }
    }

    lines.push("## Steps");
    lines.push("");
    for (const step of result.steps) {
      const icon = step.status === "passed" ? "✅" : step.status === "failed" ? "❌" : "⏭️";
      lines.push(`${icon} Step ${step.index}: ${step.status} (${step.duration}s)`);
    }
    lines.push("");

    if (result.shareUrl) {
      lines.push("## Kane Dashboard");
      lines.push(result.shareUrl);
      lines.push("");
    }

    if (result.evidencePath) {
      lines.push("## Local Evidence");
      lines.push("```");
      lines.push(`kane-cli evidence serve ${result.evidencePath}`);
      lines.push("```");
      lines.push("");
    }

    lines.push("---");
    lines.push("This report was generated by Invisible Break's watcher.");
    lines.push("Read it, fix the code, save — the watcher will re-run Kane automatically.");

    return lines.join("\n");
  }

  saveFailureReport(result: RunResult, outputDir?: string): string | null {
    const report = this.generateFailureReport(result);
    if (!report) return null;

    const dir = outputDir ?? join(PROJECT_ROOT, "watcher-output");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const filename = `failure-${Date.now()}.md`;
    const filepath = join(dir, filename);
    writeFileSync(filepath, report, "utf-8");

    // Also write a stable "latest" file for the agent to read
    const latestPath = join(dir, "failure.md");
    writeFileSync(latestPath, report, "utf-8");

    return latestPath;
  }
}
