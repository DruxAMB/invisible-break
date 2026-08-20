import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { getCart, cartCount } from "@/lib/cart";
import { addProduct } from "@/lib/actions";

export default async function HomePage() {
  const cart = await getCart();
  const count = cartCount(cart);

  return (
    <div className="min-h-screen bg-studio-charcoal text-bone-white">
      {/* Navigation — transparent, no border, lavender outlined links */}
      <header className="px-6 py-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <Link href="/" className="font-gt-flexa text-base font-normal text-bone-white">
            <span className="text-ember-orange">●</span> QuantumStore
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-[20px] border border-lavender-link px-4 py-2 font-gt-flexa text-sm font-normal text-lavender-link transition hover:bg-lavender-link/10"
            >
              Verify
            </Link>
            <Link
              href="/cart"
              className="rounded-[20px] border border-lavender-link px-4 py-2 font-gt-flexa text-sm font-normal text-lavender-link transition hover:bg-lavender-link/10"
            >
              Cart{count > 0 ? ` (${count})` : ""}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — media card + weight-200 headline below at 48px gap */}
      <section className="mx-auto max-w-[1200px] px-6 pt-16">
        {/* Media card — charcoal bg, 20px radius, 1px ash-gray border, centered product render */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-[20px] border border-ash-gray/40">
          <div className="flex h-full items-center justify-center bg-carbon/30">
            <span className="text-[120px] leading-none">☕</span>
          </div>
          {/* Play overlay button — white fill, black text, 20px radius */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <span className="inline-block rounded-[20px] bg-bone-white px-4 py-1 font-gt-flexa text-sm font-normal text-carbon">
              Play film
            </span>
          </div>
        </div>

        {/* Hero headline — 48px gap below media card, weight 200, 68px */}
        <div className="pt-12">
          <h1 className="font-gt-flexa text-[68px] font-extralight leading-[1.06] text-bone-white">
            Future-grade gear
            <br />
            for today.
          </h1>
          <p className="mt-8 max-w-md font-times text-base leading-[1.2] text-bone-white/80">
            Four products. No fluff. Free shipping through spacetime.
          </p>
        </div>
      </section>

      {/* Section header — Tobias voice, all caps, tight tracking */}
      <section className="mx-auto max-w-[1200px] px-6 pt-32 pb-8">
        <h2 className="font-tobias-light text-[42px] font-normal uppercase tracking-[-0.062em] text-bone-white">
          Catalog
        </h2>
      </section>

      {/* Product grid — feature cards: bleed image top, caption bottom */}
      <section className="mx-auto max-w-[1200px] px-6 pb-32">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-[20px] border border-ash-gray/40"
            >
              {/* Top half — square product visual, bleeds to card edge, no padding */}
              <div className="flex aspect-square items-center justify-center bg-carbon/30">
                <span className="text-[80px] leading-none">{product.emoji}</span>
              </div>
              {/* Bottom half — 24px padding, caption + price + ghost button */}
              <div className="p-6">
                <h3 className="font-gt-flexa text-[24px] font-normal text-bone-white">
                  {product.name}
                </h3>
                <p className="mt-2 font-times text-sm leading-[1.2] text-ash-gray">
                  {product.description}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="font-gt-flexa text-base font-normal text-bone-white">
                    ${product.price.toFixed(2)}
                  </span>
                  {/* White ghost button — secondary purchase action */}
                  <form action={addProduct}>
                    <input type="hidden" name="productId" value={product.id} />
                    <button
                      type="submit"
                      className="rounded-[20px] border border-bone-white px-4 py-px font-gt-flexa text-sm font-normal text-bone-white shadow-[0_0_30px_rgba(255,255,255,0.3)] transition hover:bg-bone-white/10"
                    >
                      Add to Cart
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer — defined by 128px gap, no borders */}
      <footer className="mx-auto max-w-[1200px] px-6 pt-32 pb-16">
        <p className="font-gt-flexa text-[68px] font-extralight leading-[1.06] text-bone-white">
          QuantumStore
        </p>
        <p className="mt-4 font-times text-sm text-ash-gray">
          Built with an AI agent. Verified with Kane CLI.
        </p>
      </footer>
    </div>
  );
}
