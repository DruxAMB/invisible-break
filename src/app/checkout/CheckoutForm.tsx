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
    <div className="flex min-h-screen flex-col bg-arcade-cream text-ink-black font-arcade">
      {/* Marquee bar */}
      <div className="marquee-sheen flex h-9 items-center justify-center px-4">
        <p className="text-[14px] font-normal leading-[1.43] text-ink-black">
          KIN. STORE. COUPONS. FREE SHIPPING THROUGH SPACETIME.
        </p>
      </div>

      {/* Header */}
      <header className="border-b border-ink-black bg-arcade-cream px-6 py-3">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <Link href="/" className="text-[18px] font-bold leading-[1.56] text-ink-black">
            ✚ QuantumStore
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-[6px] border border-ink-black px-3 py-1 text-[14px] font-bold leading-[1.43] text-ink-black transition hover:bg-ink-black hover:text-arcade-cream"
            >
              VERIFY
            </Link>
            <Link
              href="/cart"
              className="rounded-[6px] border border-ink-black px-3 py-1 text-[14px] font-bold leading-[1.43] text-ink-black transition hover:bg-ink-black hover:text-arcade-cream"
            >
              CART
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-[44px]">
        <h1 className="mb-[44px] text-[18px] font-bold leading-[1.56] text-ink-black">
          CHECKOUT
        </h1>

        {breaksEnabled && (
          <div className="mb-6 rounded-[12px] border border-ink-black bg-arcade-cream p-3">
            <p className="text-[14px] font-normal leading-[1.43] text-ink-black">
              INVISIBLE BREAKS ENABLED. THE PAGE LOOKS FINE, BUT KANE CLI WILL CATCH
              CONSOLE ERRORS AND 500 RESPONSES.{" "}
              <Link href="/checkout" className="font-bold underline">
                TRY THE FIXED VERSION
              </Link>
              .
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div>
            <label className="mb-1 block text-[14px] font-bold leading-[1.43] text-ink-black">
              FULL NAME
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full rounded-[6px] border border-ink-black bg-arcade-cream px-3 py-2 text-[16px] font-normal leading-[1.5] text-ink-black outline-none transition focus:border-charcoal"
              placeholder="Ada Lovelace"
            />
          </div>

          <div>
            <label className="mb-1 block text-[14px] font-bold leading-[1.43] text-ink-black">
              EMAIL
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-[6px] border border-ink-black bg-arcade-cream px-3 py-2 text-[16px] font-normal leading-[1.5] text-ink-black outline-none transition focus:border-charcoal"
              placeholder="ada@analytical.engine"
            />
          </div>

          <div>
            <label className="mb-1 block text-[14px] font-bold leading-[1.43] text-ink-black">
              SHIPPING ADDRESS
            </label>
            <textarea
              name="address"
              required
              rows={3}
              className="w-full rounded-[6px] border border-ink-black bg-arcade-cream px-3 py-2 text-[16px] font-normal leading-[1.5] text-ink-black outline-none transition focus:border-charcoal"
              placeholder="221B Baker Street, London, NW1 6XE"
            />
          </div>

          <div className="flex items-center justify-between rounded-[12px] border border-pixel-gray bg-arcade-cream p-3">
            <span className="text-[14px] font-normal leading-[1.43] text-ink-black">
              SHIPPING
            </span>
            <span className="text-[14px] font-bold leading-[1.43] text-ink-black">
              {shippingRate !== null ? `$${shippingRate.toFixed(2)}` : "Calculating…"}
            </span>
          </div>

          {/* Single green CTA — the purchase action */}
          <button
            type="submit"
            disabled={submitting}
            className="block w-full rounded-[6px] bg-buy-green px-4 py-2 text-[14px] font-bold uppercase leading-[1.43] text-white shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-buy-green/90 disabled:opacity-40"
          >
            {submitting ? "PROCESSING…" : "COMPLETE ORDER"}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-pixel-gray bg-arcade-cream px-6 py-4">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <p className="text-[14px] font-normal leading-[1.43] text-ink-black">
            © QUANTUMSTORE 2026
          </p>
          <div className="flex gap-6">
            <span className="text-[14px] font-bold leading-[1.43] text-ink-black">
              BUILT WITH DEVIN
            </span>
            <span className="text-[14px] font-bold leading-[1.43] text-ink-black">
              VERIFIED WITH KANE
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
