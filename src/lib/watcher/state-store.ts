import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const STATE_FILE = join(process.cwd(), "watcher-output", "state.json");
const RESULT_MD = join(process.cwd(), "kane-tests", "output-checkout_flow", "Result.md");

type WatcherStateData = {
  status: string;
  lastResult: unknown;
  progress: unknown[];
  failureReportPath?: string;
  updatedAt: string;
};

const DEFAULT_STATE: WatcherStateData = {
  status: "idle",
  lastResult: null,
  progress: [],
  updatedAt: new Date().toISOString(),
};

/**
 * Parse the committed Result.md to extract the last known run state.
 * This provides the initial dashboard state without running Kane.
 */
function parseResultMd(): WatcherStateData | null {
  try {
    if (!existsSync(RESULT_MD)) return null;
    const content = readFileSync(RESULT_MD, "utf-8");

    // Parse frontmatter
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) return null;
    const fm = fmMatch[1];
    const statusMatch = fm.match(/status:\s*(\w+)/);
    const durationMatch = fm.match(/duration_s:\s*([\d.]+)/);
    const sessionMatch = fm.match(/session_id:\s*([\w-]+)/);

    if (!statusMatch) return null;
    const status = statusMatch[1];
    const duration = durationMatch ? parseFloat(durationMatch[1]) : 0;
    const sessionId = sessionMatch ? sessionMatch[1] : "";

    // Parse steps
    const steps: Array<{ index: number; heading: string; status: string; duration: number }> = [];
    const stepRegex = /## (.+?) ([✓✗⏭])\s*(?:passed|failed|skipped)?\s*\(([\d.]+)s\)/g;
    let match;
    let idx = 1;
    while ((match = stepRegex.exec(content)) !== null) {
      const heading = match[1].trim();
      const symbol = match[2];
      const dur = parseFloat(match[3]);
      const stepStatus = symbol === "✓" ? "passed" : symbol === "✗" ? "failed" : "skipped";
      steps.push({ index: idx++, heading, status: stepStatus, duration: dur });
    }

    // Extract failure reason if present
    const reasonMatch = content.match(/Reason:\s*(.+?)(?:\r?\n|$)/);
    const bugTitleMatch = reasonMatch?.[1]?.match(/bug verdict:\s*(.+?)(?:\s*\[|$)/);
    const confidenceMatch = reasonMatch?.[1]?.match(/confidence\s*([\d.]+)/);

    // Known evidence signals from the committed red-state run.
    // These are the two invisible breaks Kane caught.
    const knownSignals =
      status === "failed"
        ? [
            {
              type: "http_error_response",
              excerpt:
                'GET http://localhost:3000/api/shipping-rates -> 500 body: {"error":"Failed to connect to shipping service","endpoint":"http://localhost:9998/rates"}',
              step: "2-1",
            },
            {
              type: "console_error",
              excerpt:
                "[Checkout] Failed to load feature flags: Cannot read properties of undefined (reading 'featureFlags')",
              step: "2-1",
            },
            {
              type: "console_error",
              excerpt:
                "Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
              step: "2-1",
            },
          ]
        : [];

    const result = {
      status,
      overallStatus: status,
      duration,
      creditsConsumed: 0,
      sessionId,
      steps,
      timestamp: new Date().toISOString(),
      testFile: "kane-tests/checkout_flow_test.md",
      bugVerdict: bugTitleMatch
        ? {
            confirmed: true,
            bug_title: bugTitleMatch[1].trim(),
            family: "application_issue",
            category: "api_error",
            severity: "major",
            confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.98,
            one_liner: "",
            root_cause: "The checkout page depends on services that are not responding correctly.",
            suggestion:
              "Fix the checkout page startup: handle missing feature flag data safely, and restore or mock the shipping-rates service.",
            signals: knownSignals,
          }
        : undefined,
    };

    return {
      status,
      lastResult: result,
      progress: [],
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function getState(): WatcherStateData {
  try {
    if (existsSync(STATE_FILE)) {
      const data = readFileSync(STATE_FILE, "utf-8");
      return JSON.parse(data);
    }
    // No state file — fall back to committed Result.md
    const fromResult = parseResultMd();
    if (fromResult) return fromResult;
    return DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

export function setState(updates: Partial<WatcherStateData>): WatcherStateData {
  const current = getState();
  const next: WatcherStateData = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  try {
    const dir = dirname(STATE_FILE);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(STATE_FILE, JSON.stringify(next, null, 2), "utf-8");
  } catch (err) {
    console.error("[StateStore] Failed to write state:", err);
  }
  return next;
}
