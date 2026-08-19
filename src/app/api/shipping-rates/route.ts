import { NextResponse } from "next/server";

// Shipping rates endpoint.
// Supports ?broken=1 to reproduce the original invisible break (500).
// Without the flag, returns a valid shipping rate.
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const broken = url.searchParams.get("broken") === "1";

  if (broken) {
    // Reproduce the original invisible break: 500 from misconfigured service
    return NextResponse.json(
      { error: "Failed to connect to shipping service", endpoint: "http://localhost:9998/rates" },
      { status: 500 }
    );
  }

  const shippingUrl = process.env.SHIPPING_SERVICE_URL;

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

  return NextResponse.json({
    rate: 5.99,
    currency: "USD",
    estimated_days: 3,
  });
}
