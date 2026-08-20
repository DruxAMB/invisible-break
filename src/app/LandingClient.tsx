"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import type { Product } from "@/lib/products";

type LandingClientProps = {
  products: Product[];
  count: number;
  addProduct: (formData: FormData) => Promise<void>;
};

export function LandingClient({ products, count, addProduct }: LandingClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-animate='marquee']", {
        opacity: 0,
        y: -10,
        duration: 0.4,
      });

      tl.from(
        "[data-animate='nav']",
        {
          opacity: 0,
          y: -10,
          duration: 0.5,
        },
        "-=0.1",
      );

      tl.from(
        "[data-animate='hero']",
        {
          opacity: 0,
          scale: 0.98,
          duration: 0.6,
        },
        "-=0.2",
      );

      tl.from(
        "[data-animate='card']",
        {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.08,
        },
        "-=0.3",
      );

      tl.from(
        "[data-animate='footer']",
        {
          opacity: 0,
          duration: 0.4,
        },
        "-=0.2",
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen flex-col bg-arcade-cream text-ink-black font-arcade"
    >
      {/* Marquee Announcement Bar — full-width orange gradient, 36px tall */}
      <div
        data-animate="marquee"
        className="marquee-sheen flex h-9 items-center justify-center px-4"
      >
        <p className="text-[14px] font-normal leading-[1.43] text-ink-black">
          KIN. STORE. COUPONS. FREE SHIPPING THROUGH SPACETIME.
        </p>
      </div>

      {/* Header Bar — cream bg, 1px black bottom border, wordmark + nav */}
      <header
        data-animate="nav"
        className="border-b border-ink-black bg-arcade-cream px-6 py-3"
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <Link
            href="/"
            className="text-[18px] font-bold leading-[1.56] text-ink-black"
          >
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
              CART{count > 0 ? ` (${count})` : ""}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — checkerboard panel with floating product + 3D/AR toggles */}
      <section
        data-animate="hero"
        className="mx-auto mt-[44px] w-full max-w-[1200px] px-6"
      >
        <div className="relative flex h-[280px] items-center justify-center overflow-hidden rounded-[12px] border border-ink-black checkerboard">
          {/* Floating product cap — centered with flat charcoal shadow */}
          <div className="relative flex flex-col items-center">
            <span className="text-[80px] leading-none drop-shadow-[0_4px_0_#333]">☕</span>
          </div>
          {/* 3D / AR pill toggles — bottom center */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <div className="flex gap-2">
              <span className="rounded-[6px] border border-ink-black bg-arcade-cream px-2 py-0.5 text-[14px] font-normal leading-[1.43] text-ink-black shadow-[inset_0_1px_0_0_#f3e5df]">
                3D
              </span>
              <span className="flex items-center gap-1 rounded-[6px] border border-ink-black bg-arcade-cream px-2 py-0.5 text-[14px] font-normal leading-[1.43] text-ink-black shadow-[inset_0_1px_0_0_#f3e5df]">
                AR
                <span className="rounded-[9999px] border border-ink-black px-1 text-[10px] font-normal leading-[1.5]">
                  AR
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Product grid — 2-column, pixel-gray hairline dividers */}
      <section className="mx-auto mt-[44px] w-full max-w-[1200px] px-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {products.map((product) => (
            <div
              key={product.id}
              data-animate="card"
              className="rounded-[12px] border border-pixel-gray bg-arcade-cream p-3"
            >
              {/* Product image — top ~70%, cream backdrop */}
              <div className="flex h-32 items-center justify-center rounded-[12px] bg-arcade-cream">
                <span className="text-[48px] leading-none">{product.emoji}</span>
              </div>
              {/* Title + price — bottom row */}
              <div className="mt-2 flex items-start justify-between">
                <h3 className="text-[14px] font-bold leading-[1.43] text-ink-black">
                  {product.name.toUpperCase()}
                </h3>
                <span className="text-[14px] font-normal leading-[1.43] text-ink-black">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              {/* Stacked controls — TRY IN AR ghost + ADD TO CART green */}
              <div className="mt-2 flex flex-col gap-1">
                {/* TRY IN AR — ghost button */}
                <button className="flex items-center justify-center gap-1 rounded-[6px] border border-ink-black bg-transparent px-3 py-1 text-[14px] font-normal leading-[1.43] text-ink-black shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-ink-black hover:text-arcade-cream">
                  TRY IN
                  <span className="rounded-[9999px] border border-ink-black px-1 text-[10px] font-normal leading-[1.5]">
                    AR
                  </span>
                </button>
                {/* ADD TO CART — filled green, the only green surface */}
                <form action={addProduct}>
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    className="w-full rounded-[6px] bg-buy-green px-3 py-2 text-[14px] font-bold uppercase leading-[1.43] text-white shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-buy-green/90"
                  >
                    ADD TO CART
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Strip — 1px pixel-gray top border, copyright left, links right */}
      <footer
        data-animate="footer"
        className="mt-[44px] border-t border-pixel-gray bg-arcade-cream px-6 py-4"
      >
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
