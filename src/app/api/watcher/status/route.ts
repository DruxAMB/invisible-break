import { NextResponse } from "next/server";
import { getState, setState } from "@/lib/watcher/state-store";
import { existsSync, rmSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const state = getState();

  // Production simulation: if status is "running" and more than 3
  // seconds have passed since the run started, auto-transition to
  // the committed result by clearing the state file so the next
  // getState() call falls back to parseResultMd().
  if (state.status === "running") {
    const updatedAt = new Date(state.updatedAt).getTime();
    const elapsed = Date.now() - updatedAt;

    if (elapsed > 3000) {
      // Clear the state file so parseResultMd() kicks in
      const stateFile = join(process.cwd(), "watcher-output", "state.json");
      try {
        rmSync(stateFile, { force: true });
      } catch {
        // ignore
      }
      const freshState = getState();
      return NextResponse.json(freshState);
    }
  }

  return NextResponse.json(state);
}
