"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function CheckoutForm({
  submitAction,
}: {
  submitAction: (formData: FormData) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [shippingRate, setShippingRate] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const breaksEnabled = searchParams.get("breaks") === "true";

  // Feature flags: safely handle missing config.
  // When breaks are enabled, this reproduces the original bug:
  // accessing .featureFlags on undefined throws a console error.
  // When breaks are disabled (the fixed state), optional chaining
  // handles the missing config gracefully.
  useEffect(() => {
    if (!breaksEnabled) {
      // Fixed state: safe access with optional chaining
      const config = (window as unknown as { __APP_CONFIG__?: { featureFlags?: { enableNewCheckout?: boolean } } }).__APP_CONFIG__;
      const featureFlags = config?.featureFlags;
      if (featureFlags?.enableNewCheckout) {
        console.log("Using new checkout flow");
      }
      return;
    }

    // Broken state: reproduces the original invisible break
    const logError = () => {
      // @ts-expect-error — simulating a missing config module
      const config = window.__APP_CONFIG__;
      try {
        const featureFlags = config.featureFlags;
        if (featureFlags.enableNewCheckout) {
          console.log("Using new checkout flow");
        }
      } catch (err) {
        console.error("[Checkout] Failed to load feature flags:", err);
      }
    };
    logError();
    const interval = setInterval(logError, 500);
    return () => clearInterval(interval);
  }, [breaksEnabled]);

  // Shipping rates: fetch on load.
  // When breaks are enabled, the API endpoint returns 500.
  // When breaks are disabled, the API returns a valid response.
  useEffect(() => {
    const url = breaksEnabled ? "/api/shipping-rates?broken=1" : "/api/shipping-rates";
    fetch(url)
      .then((resp) => {
        if (!resp.ok) throw new Error(`Shipping API returned ${resp.status}`);
        return resp.json();
      })
      .then((data) => {
        setShippingRate(data.rate ?? 5.99);
      })
      .catch(() => {
        setShippingRate(5.99);
      });

    if (breaksEnabled) {
      // Broken state: retry every 500ms to ensure the 500 is captured
      const interval = setInterval(() => {
        fetch(url).catch(() => setShippingRate(5.99));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [breaksEnabled]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      submitAction(formData);
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Quantum<span className="text-emerald-400">Store</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:border-zinc-500"
            >
              🛡️ Verify
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:border-zinc-500"
            >
              🛒 Cart
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>

        {breaksEnabled && (
          <div className="mb-6 rounded-lg border border-amber-800 bg-amber-950/30 px-4 py-3 text-sm text-amber-300">
            ⚠️ <strong>Invisible breaks enabled.</strong> The page looks fine,
            but Kane CLI will catch console errors and 500 responses.
            Try the{" "}
            <Link href="/checkout" className="underline hover:text-amber-200">
              fixed version
            </Link>
            .
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none transition focus:border-emerald-500"
              placeholder="Ada Lovelace"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none transition focus:border-emerald-500"
              placeholder="ada@analytical.engine"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Shipping Address
            </label>
            <textarea
              name="address"
              required
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none transition focus:border-emerald-500"
              placeholder="221B Baker Street, London, NW1 6XE"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
            <span className="text-sm text-zinc-400">Shipping</span>
            <span className="font-medium text-emerald-400">
              {shippingRate !== null ? `$${shippingRate.toFixed(2)}` : "Calculating…"}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-500 px-6 py-4 text-base font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {submitting ? "Processing…" : "Complete Order"}
          </button>
        </form>
      </main>
    </div>
  );
}
