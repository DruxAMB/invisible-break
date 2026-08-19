import Link from "next/link";
import { getCart, cartTotal, cartCount } from "@/lib/cart";
import { removeProduct } from "@/lib/actions";

export default async function CartPage() {
  const cart = await getCart();
  const total = cartTotal(cart);
  const count = cartCount(cart);

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
            {count > 0 && (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-black">
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <p className="mb-4 text-zinc-400">Your cart is empty.</p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div className="text-3xl">{item.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-zinc-400">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-lg font-bold text-emerald-400">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <form action={removeProduct}>
                    <input type="hidden" name="productId" value={item.productId} />
                    <button
                      type="submit"
                      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-6">
              <div>
                <p className="text-sm text-zinc-400">Total</p>
                <p className="text-2xl font-bold text-emerald-400">
                  ${total.toFixed(2)}
                </p>
              </div>
              <Link
                href="/checkout"
                className="rounded-lg bg-emerald-500 px-8 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Checkout →
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
