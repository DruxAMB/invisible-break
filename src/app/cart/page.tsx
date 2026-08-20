import Link from "next/link";
import { getCart, cartTotal, cartCount } from "@/lib/cart";
import { removeProduct } from "@/lib/actions";

export default async function CartPage() {
  const cart = await getCart();
  const total = cartTotal(cart);
  const count = cartCount(cart);

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
              CART{count > 0 ? ` (${count})` : ""}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-[44px]">
        <h1 className="mb-[44px] text-[18px] font-bold leading-[1.56] text-ink-black">
          YOUR CART
        </h1>

        {cart.length === 0 ? (
          <div className="rounded-[12px] border border-pixel-gray bg-arcade-cream p-12">
            <p className="mb-4 text-[16px] font-normal leading-[1.5] text-ink-black">
              Your cart is empty.
            </p>
            <Link
              href="/"
              className="inline-block rounded-[6px] border border-ink-black px-3 py-1 text-[14px] font-normal leading-[1.43] text-ink-black shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-ink-black hover:text-arcade-cream"
            >
              BROWSE PRODUCTS
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 rounded-[12px] border border-pixel-gray bg-arcade-cream p-3"
                >
                  <span className="text-[24px] leading-none">{item.emoji}</span>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-bold leading-[1.43] text-ink-black">
                      {item.name.toUpperCase()}
                    </h3>
                    <p className="text-[14px] font-normal leading-[1.43] text-ink-black">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-[14px] font-normal leading-[1.43] text-ink-black">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <form action={removeProduct}>
                    <input type="hidden" name="productId" value={item.productId} />
                    <button
                      type="submit"
                      className="rounded-[6px] border border-muted-gray px-2 py-0.5 text-[14px] font-normal leading-[1.43] text-muted-gray transition hover:border-ink-black hover:text-ink-black"
                    >
                      REMOVE
                    </button>
                  </form>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-pixel-gray pt-4">
              <div>
                <p className="text-[14px] font-normal leading-[1.43] text-ink-black">TOTAL</p>
                <p className="text-[18px] font-bold leading-[1.56] text-ink-black">
                  ${total.toFixed(2)}
                </p>
              </div>
              {/* Single green CTA — checkout is the purchase action */}
              <Link
                href="/checkout"
                className="rounded-[6px] bg-buy-green px-4 py-2 text-[14px] font-bold uppercase leading-[1.43] text-white shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-buy-green/90"
              >
                CHECKOUT →
              </Link>
            </div>
          </>
        )}
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
