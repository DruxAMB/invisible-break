import Link from "next/link";
import { getCart, cartTotal, cartCount } from "@/lib/cart";
import { removeProduct } from "@/lib/actions";

export default async function CartPage() {
  const cart = await getCart();
  const total = cartTotal(cart);
  const count = cartCount(cart);

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
              Cart{count > 0 ? ` (${count})` : ""}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-16">
        <h1 className="mb-16 font-gt-flexa text-[68px] font-extralight leading-[1.06] text-bone-white">
          Your Cart
        </h1>

        {cart.length === 0 ? (
          <div className="rounded-[20px] border border-ash-gray/40 p-24 text-center">
            <p className="mb-8 font-times text-base text-ash-gray">
              Your cart is empty.
            </p>
            <Link
              href="/"
              className="inline-block rounded-[20px] bg-ember-orange px-6 py-1.5 font-gt-flexa text-sm font-normal text-bone-white shadow-[0_0_30px_rgba(245,86,0,0.6)] transition hover:bg-ember-orange/90"
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
                  className="flex items-center gap-6 rounded-[20px] border border-ash-gray/40 p-6"
                >
                  <div className="text-3xl">{item.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-gt-flexa text-[24px] font-normal text-bone-white">
                      {item.name}
                    </h3>
                    <p className="font-times text-sm text-ash-gray">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="font-gt-flexa text-lg font-normal text-bone-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <form action={removeProduct}>
                    <input type="hidden" name="productId" value={item.productId} />
                    <button
                      type="submit"
                      className="rounded-[20px] border border-ash-gray/40 px-4 py-1.5 font-gt-flexa text-xs text-ash-gray transition hover:border-bone-white hover:text-bone-white"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              ))}
            </div>

            <div className="mt-16 flex items-center justify-between border-t border-ash-gray/20 pt-8">
              <div>
                <p className="font-times text-sm text-ash-gray">Total</p>
                <p className="font-gt-flexa text-[32px] font-extralight text-bone-white">
                  ${total.toFixed(2)}
                </p>
              </div>
              <Link
                href="/checkout"
                className="rounded-[20px] bg-ember-orange px-8 py-1.5 font-gt-flexa text-sm font-normal text-bone-white shadow-[0_0_30px_rgba(245,86,0,0.6)] transition hover:bg-ember-orange/90"
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
