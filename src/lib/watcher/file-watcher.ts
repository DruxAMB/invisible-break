import { watch, FSWatcher } from "fs";
import { join, dirname, basename } from "path";
import { existsSync, statSync } from "fs";
import { KaneWatcher, RunResult } from "./kane-watcher";

const PROJECT_ROOT = join(dirname(__dirname), "..", "..");
const WATCH_DIRS = [
  join(PROJECT_ROOT, "src"),
];
const WATCH_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const DEBOUNCE_MS = 3000;

export class FileWatcher {
  private watchers: FSWatcher[] = [];
  private kaneWatcher: KaneWatcher;
  private debounceTimer: NodeJS.Timeout | null = null;
  private running = false;
  private lastResult: RunResult | null = null;
  private onResult?: (result: RunResult) => void;
  private onStatus?: (status: string) => void;

  constructor(opts: {
    onResult?: (result: RunResult) => void;
    onStatus?: (status: string) => void;
  } = {}) {
    this.kaneWatcher = new KaneWatcher();
    this.onResult = opts.onResult;
    this.onStatus = opts.onStatus;
  }

  get result(): RunResult | null {
    return this.lastResult ?? this.kaneWatcher.result;
  }

  get status(): string {
    if (this.running) return "running";
    return this.kaneWatcher.status;
  }

  start(): void {
    for (const dir of WATCH_DIRS) {
      this.watchDir(dir);
    }
    console.log(`[FileWatcher] Watching ${WATCH_DIRS.join(", ")} for changes`);
    console.log(`[FileWatcher] Debounce: ${DEBOUNCE_MS}ms`);
    console.log(`[FileWatcher] Extensions: ${WATCH_EXTENSIONS.join(", ")}`);
  }

  stop(): void {
    for (const w of this.watchers) {
      w.close();
    }
    this.watchers = [];
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    console.log("[FileWatcher] Stopped");
  }

  private watchDir(dir: string): void {
    if (!existsSync(dir)) return;

    const watcher = watch(dir, { recursive: true }, (event, filename) => {
      if (!filename) return;
      const fullPath = join(dir, filename);
      if (!WATCH_EXTENSIONS.some((ext) => filename.endsWith(ext))) return;
      this.handleFileChange(fullPath);
    });

    this.watchers.push(watcher);
  }

  private handleFileChange(filepath: string): void {
    console.log(`[FileWatcher] Change detected: ${basename(filepath)}`);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.triggerRun().catch((err) => {
        console.error("[FileWatcher] Run failed:", err);
        this.running = false;
        this.onStatus?.("idle");
      });
    }, DEBOUNCE_MS);
  }

  async triggerRun(): Promise<RunResult | null> {
    if (this.running) {
      console.log("[FileWatcher] Run already in progress, skipping");
      return null;
    }

    this.running = true;
    this.onStatus?.("running");
    console.log("[FileWatcher] Triggering Kane run...");

    try {
      const result = await this.kaneWatcher.run();
      this.lastResult = result;
      this.running = false;
      this.onStatus?.(result.status);

      if (result.overallStatus === "failed") {
        const reportPath = this.kaneWatcher.saveFailureReport(result);
        if (reportPath) {
          console.log(`[FileWatcher] Failure report saved: ${reportPath}`);
          console.log("[FileWatcher] Agent can read this file and fix the code.");
        }
      } else {
        console.log("[FileWatcher] All checks passed! 🎉");
      }

      this.onResult?.(result);
      return result;
    } catch (err) {
      this.running = false;
      this.onStatus?.("idle");
      throw err;
    }
  }
}
