import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory state for the watcher (shared across requests in dev)
// In production, this would be a proper store.
declare global {
  // eslint-disable-next-line no-var
  var __ibWatcherState: {
    status: string;
    lastResult: unknown;
    progress: unknown[];
  } | undefined;
}

if (!globalThis.__ibWatcherState) {
  globalThis.__ibWatcherState = {
    status: "idle",
    lastResult: null,
    progress: [],
  };
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(globalThis.__ibWatcherState ?? { status: "idle" });
}
