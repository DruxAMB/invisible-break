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
  useEffect(() => {
    if (!breaksEnabled) {
      const config = (window as unknown as { __APP_CONFIG__?: { featureFlags?: { enableNewCheckout?: boolean } } }).__APP_CONFIG__;
      const featureFlags = config?.featureFlags;
      if (featureFlags?.enableNewCheckout) {
        console.log("Using new checkout flow");
      }
      return;
    }

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
    <div className="min-h-screen bg-studio-charcoal text-bone-white">
      {/* Navigation */}
      <header className="px-6 py-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <Link href="/" className="font-gt-flexa text-base font-normal text-bone-white">
            <span className="text-ember-orange">●</span> QuantumStore
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-[20px] border border-lavender-link px-4 py-2 font-gt-flexa text-sm text-lavender-link transition hover:bg-lavender-link/10"
            >
              Verify
            </Link>
            <Link
              href="/cart"
              className="rounded-[20px] border border-lavender-link px-4 py-2 font-gt-flexa text-sm text-lavender-link transition hover:bg-lavender-link/10"
            >
              Cart
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-16">
        <h1 className="mb-16 font-gt-flexa text-[68px] font-extralight leading-[1.06] text-bone-white">
          Checkout
        </h1>

        {breaksEnabled && (
          <div className="mb-12 rounded-[20px] border border-ember-orange/40 px-6 py-4 font-times text-sm text-ember-orange">
            Invisible breaks enabled. The page looks fine, but Kane CLI will catch
            console errors and 500 responses.{" "}
            <Link href="/checkout" className="text-lavender-link hover:underline">
              Try the fixed version
            </Link>
            .
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-xl space-y-8">
          <div>
            <label className="mb-2 block font-gt-flexa text-sm font-normal text-ash-gray">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full rounded-[20px] border border-ash-gray/40 bg-studio-charcoal px-4 py-3 font-times text-base text-bone-white outline-none transition focus:border-bone-white"
              placeholder="Ada Lovelace"
            />
          </div>

          <div>
            <label className="mb-2 block font-gt-flexa text-sm font-normal text-ash-gray">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-[20px] border border-ash-gray/40 bg-studio-charcoal px-4 py-3 font-times text-base text-bone-white outline-none transition focus:border-bone-white"
              placeholder="ada@analytical.engine"
            />
          </div>

          <div>
            <label className="mb-2 block font-gt-flexa text-sm font-normal text-ash-gray">
              Shipping Address
            </label>
            <textarea
              name="address"
              required
              rows={3}
              className="w-full rounded-[20px] border border-ash-gray/40 bg-studio-charcoal px-4 py-3 font-times text-base text-bone-white outline-none transition focus:border-bone-white"
              placeholder="221B Baker Street, London, NW1 6XE"
            />
          </div>

          <div className="flex items-center justify-between rounded-[20px] border border-ash-gray/40 px-6 py-4">
            <span className="font-times text-sm text-ash-gray">Shipping</span>
            <span className="font-gt-flexa text-base font-normal text-bone-white">
              {shippingRate !== null ? `$${shippingRate.toFixed(2)}` : "Calculating…"}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-[20px] bg-ember-orange px-6 py-2 font-gt-flexa text-base font-normal text-bone-white shadow-[0_0_30px_rgba(245,86,0,0.6)] transition hover:bg-ember-orange/90 disabled:opacity-40"
          >
            {submitting ? "Processing…" : "Complete Order"}
          </button>
        </form>
      </main>
    </div>
  );
}
