import { NextResponse } from "next/server";

// Invisible break #2: This analytics endpoint silently returns 500.
// The checkout page fires this as a background analytics call
// (fire-and-forget). The UI doesn't surface the error — the user
// sees a successful checkout. But the network tab shows a 500,
// and Kane's DevTools network assertion catches it.
//
// The "bug": the analytics service URL is misconfigured — it points
// to an internal endpoint that doesn't exist in production.
export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json().catch(() => ({}));

  // Simulated misconfiguration: trying to reach an internal analytics
  // service that isn't available in this environment.
  const analyticsUrl = process.env.ANALYTICS_SERVICE_URL ?? "http://localhost:9999/ingest";

  try {
    const resp = await fetch(analyticsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "checkout_completed",
        ...body,
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(3000),
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Analytics service returned ${resp.status}` },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    // The 500 that Kane catches — the analytics service is unreachable.
    return NextResponse.json(
      { error: "Failed to connect to analytics service", endpoint: analyticsUrl },
      { status: 500 }
    );
  }
}
