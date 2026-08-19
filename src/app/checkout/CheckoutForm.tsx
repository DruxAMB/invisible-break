"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";

export function CheckoutForm({
  submitAction,
}: {
  submitAction: (formData: FormData) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [shippingRate, setShippingRate] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // Invisible break #1: A console error that fires on page load
  // AND continues firing every 500ms. This simulates a real bug
  // where a feature flag/config object is undefined in production.
  // The UI renders fine, but Kane's DevTools console assertion catches it.
  // The frequent interval ensures the error is captured in every
  // sub-step's console capture window (Kane resets capture per sub-step).
  useEffect(() => {
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
  }, []);

  // Invisible break #2: A silent 500 on a background API call.
  // The checkout page fetches shipping rates on load and retries
  // every 500ms. When the endpoint returns 500, the page
  // gracefully degrades to a default flat rate. The UI looks
  // perfect, but the network tab shows a 500, and Kane's DevTools
  // network assertion catches it.
  // The frequent interval ensures the 500 is captured in every
  // sub-step's network capture window.
  useEffect(() => {
    const fetchRates = () => {
      fetch("/api/shipping-rates")
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
    };
    fetchRates();
    const interval = setInterval(fetchRates, 500);
    return () => clearInterval(interval);
  }, []);

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
          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm"
          >
            🛒 Cart
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>

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
