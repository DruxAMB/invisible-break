import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Trigger a Kane run via the watcher
export async function POST(): Promise<NextResponse> {
  try {
    // Dynamic import to avoid loading the watcher in production builds
    const { KaneWatcher } = await import("@/lib/watcher/kane-watcher");

    const kane = new KaneWatcher();

    // Update global state
    if (globalThis.__ibWatcherState) {
      globalThis.__ibWatcherState.status = "running";
      globalThis.__ibWatcherState.progress = [];
    }

    // Run in background — don't block the response
    kane.run().then((result) => {
      if (globalThis.__ibWatcherState) {
        globalThis.__ibWatcherState.status = result.status;
        globalThis.__ibWatcherState.lastResult = result;
      }

      if (result.overallStatus === "failed") {
        const reportPath = kane.saveFailureReport(result);
        if (reportPath && globalThis.__ibWatcherState) {
          (globalThis.__ibWatcherState as { failureReportPath?: string }).failureReportPath = reportPath;
        }
      }
    }).catch((err) => {
      console.error("[Watcher API] Run failed:", err);
      if (globalThis.__ibWatcherState) {
        globalThis.__ibWatcherState.status = "idle";
      }
    });

    return NextResponse.json({ status: "running", message: "Kane verification started" });
  } catch (err) {
    console.error("[Watcher API] Error:", err);
    return NextResponse.json(
      { error: "Failed to start verification", detail: String(err) },
      { status: 500 }
    );
  }
}
