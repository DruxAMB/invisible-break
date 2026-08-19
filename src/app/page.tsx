import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { getCart, cartCount } from "@/lib/cart";
import { addProduct } from "@/lib/actions";

export default async function HomePage() {
  const cart = await getCart();
  const count = cartCount(cart);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
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
              {count > 0 && (
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-black">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Products */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Future-grade gear for today.
        </h1>
        <p className="mb-8 text-zinc-400">
          Four products. No fluff. Free shipping through spacetime.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600"
            >
              <div className="mb-4 text-5xl">{product.emoji}</div>
              <h2 className="mb-1 text-lg font-semibold">{product.name}</h2>
              <p className="mb-4 text-sm text-zinc-400">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-emerald-400">
                  ${product.price.toFixed(2)}
                </span>
                <form action={addProduct}>
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
                  >
                    Add to Cart
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
