"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";

export function CheckoutForm({
  submitAction,
}: {
  submitAction: (formData: FormData) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  // Invisible break #1: A console error on page load.
  // This simulates a real bug where a feature flag/config object
  // is undefined in production. The UI renders fine because the
  // error happens in a non-critical initialization path, but
  // Kane's DevTools console assertion catches it.
  useEffect(() => {
    // @ts-expect-error — simulating a missing config module
    const config = window.__APP_CONFIG__;
    // This throws a TypeError: Cannot read properties of undefined
    // It logs to console.error but doesn't crash the page.
    try {
      const featureFlags = config.featureFlags;
      if (featureFlags.enableNewCheckout) {
        console.log("Using new checkout flow");
      }
    } catch (err) {
      console.error("[Checkout] Failed to load feature flags:", err);
    }
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    // Fire-and-forget analytics call — invisible break #2.
    // The /api/checkout-analytics endpoint returns 500, but
    // we don't await this or surface errors, so the user never
    // sees the failure. The 500 only appears in the network tab.
    fetch("/api/checkout-analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        address: formData.get("address"),
      }),
    }).catch(() => {
      // Silently swallowed — the bug. A real app should log this.
    });

    // Submit via server action (sets order cookie, redirects)
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
