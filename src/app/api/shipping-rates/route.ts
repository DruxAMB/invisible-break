import { NextResponse } from "next/server";

// Invisible break #2: This shipping rates endpoint silently returns 500.
// The checkout page calls this on load to fetch shipping rates.
// When it fails, the page gracefully degrades to a default flat rate
// ($5.99) — the UI looks perfect. But the network tab shows a 500,
// and Kane's DevTools network assertion catches it.
//
// The "bug": the shipping service URL is misconfigured — it points
// to an internal endpoint that doesn't exist in this environment.
export async function GET(): Promise<NextResponse> {
  const shippingUrl =
    process.env.SHIPPING_SERVICE_URL ?? "http://localhost:9998/rates";

  try {
    const resp = await fetch(shippingUrl, {
      signal: AbortSignal.timeout(3000),
    });
    if (!resp.ok) {
      return NextResponse.json(
        { error: `Shipping service returned ${resp.status}` },
        { status: 502 }
      );
    }
    const data = await resp.json();
    return NextResponse.json(data);
  } catch {
    // The 500 that Kane catches — the shipping service is unreachable.
    return NextResponse.json(
      { error: "Failed to connect to shipping service", endpoint: shippingUrl },
      { status: 500 }
    );
  }
}
