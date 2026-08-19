import { NextResponse } from "next/server";
import { setState } from "@/lib/watcher/state-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(): Promise<NextResponse> {
  try {
    console.log("[Watcher API] Starting Kane run...");

    // Dynamic import to avoid loading the watcher in production builds
    const { KaneWatcher } = await import("@/lib/watcher/kane-watcher");
    console.log("[Watcher API] KaneWatcher imported");

    const kane = new KaneWatcher();
    console.log("[Watcher API] KaneWatcher instantiated");

    // Update state to running
    setState({ status: "running", progress: [] });

    // Run in background — don't block the response
    kane.run().then((result) => {
      console.log(`[Watcher API] Run completed: ${result.overallStatus}`);
      setState({
        status: result.status,
        lastResult: result,
      });

      if (result.overallStatus === "failed") {
        const reportPath = kane.saveFailureReport(result);
        console.log(`[Watcher API] Failure report: ${reportPath}`);
        if (reportPath) {
          setState({ failureReportPath: reportPath });
        }
      }
    }).catch((err) => {
      console.error("[Watcher API] Run failed:", err);
      setState({ status: "idle" });
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
