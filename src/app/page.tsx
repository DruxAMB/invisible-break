import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { getCart, cartCount } from "@/lib/cart";
import { addProduct } from "@/lib/actions";

export default async function HomePage() {
  const cart = await getCart();
  const count = cartCount(cart);

  return (
    <div className="min-h-screen bg-studio-charcoal text-bone-white">
      {/* Navigation — transparent, no border, lavender outlined links + ember CTA */}
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
              Cart{count > 0 ? ` (${count})` : ""}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — weight-200 headline, serif body, vast negative space */}
      <section className="mx-auto max-w-[1200px] px-6 pt-24 pb-16">
        <h1 className="font-gt-flexa text-[68px] font-extralight leading-[1.06] text-bone-white">
          Future-grade gear
          <br />
          for today.
        </h1>
        <p className="mt-8 max-w-md font-times text-base leading-[1.2] text-bone-white/80">
          Four products. No fluff. Free shipping through spacetime.
        </p>
      </section>

      {/* Section header — Tobias voice, all caps, tight tracking */}
      <section className="mx-auto max-w-[1200px] px-6 pb-8">
        <h2 className="font-tobias-light text-[42px] font-normal uppercase tracking-[-0.062em] text-bone-white">
          Catalog
        </h2>
      </section>

      {/* Product grid — feature cards with ash gray borders, 20px radius */}
      <section className="mx-auto max-w-[1200px] px-6 pb-32">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="rounded-[20px] border border-ash-gray/40 bg-studio-charcoal p-6 transition hover:border-ash-gray"
            >
              <div className="mb-6 flex h-40 items-center justify-center rounded-[20px] bg-carbon/40">
                <span className="text-5xl">{product.emoji}</span>
              </div>
              <h3 className="mb-2 font-gt-flexa text-[24px] font-normal text-bone-white">
                {product.name}
              </h3>
              <p className="mb-6 font-times text-sm leading-[1.2] text-ash-gray">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-gt-flexa text-xl font-normal text-bone-white">
                  ${product.price.toFixed(2)}
                </span>
                <form action={addProduct}>
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    className="rounded-[20px] bg-ember-orange px-4 py-1 font-gt-flexa text-sm font-normal text-bone-white shadow-[0_0_30px_rgba(245,86,0,0.6)] transition hover:bg-ember-orange/90"
                  >
                    Add to Cart
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer — defined by gap, no borders */}
      <footer className="mx-auto max-w-[1200px] px-6 pt-32 pb-16">
        <p className="font-gt-flexa text-[42px] font-extralight leading-[1.2] text-bone-white">
          QuantumStore
        </p>
        <p className="mt-4 font-times text-sm text-ash-gray">
          Built with an AI agent. Verified with Kane CLI.
        </p>
      </footer>
    </div>
  );
}
