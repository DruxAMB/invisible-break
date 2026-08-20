import { NextResponse } from "next/server";
import { setState, getState } from "@/lib/watcher/state-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(): Promise<NextResponse> {
  try {
    const isProduction =
      process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

    if (isProduction) {
      // On Vercel, the Kane CLI binary doesn't exist and localhost
      // isn't reachable. Set to "running" with a timestamp — the
      // status endpoint will auto-transition to the committed result
      // after 3 seconds (see status/route.ts).
      setState({
        status: "running",
        progress: [],
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        status: "running",
        message: "Simulating verification run (production mode)",
      });
    }

    // Local development — actually run Kane CLI
    console.log("[Watcher API] Starting Kane run...");

    const { KaneWatcher } = await import("@/lib/watcher/kane-watcher");
    const kane = new KaneWatcher();

    setState({ status: "running", progress: [] });

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
