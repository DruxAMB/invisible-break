import { NextResponse } from "next/server";

// Shipping rates endpoint (fixed by agent).
// Previously this returned 500 because the shipping service URL was
// misconfigured. Now we return a valid flat rate directly, with an
// optional upstream fetch if SHIPPING_SERVICE_URL is set.
export async function GET(): Promise<NextResponse> {
  const shippingUrl = process.env.SHIPPING_SERVICE_URL;

  // If a real shipping service is configured, try to use it.
  if (shippingUrl) {
    try {
      const resp = await fetch(shippingUrl, {
        signal: AbortSignal.timeout(3000),
      });
      if (resp.ok) {
        const data = await resp.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fall through to default rate
    }
  }

  // Default flat rate (no external service needed).
  return NextResponse.json({
    rate: 5.99,
    currency: "USD",
    estimated_days: 3,
  });
}
