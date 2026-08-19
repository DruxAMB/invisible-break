import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const STATE_FILE = join(process.cwd(), "watcher-output", "state.json");

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

export function getState(): WatcherStateData {
  try {
    if (!existsSync(STATE_FILE)) return DEFAULT_STATE;
    const data = readFileSync(STATE_FILE, "utf-8");
    return JSON.parse(data);
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
