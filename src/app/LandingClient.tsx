"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import gsap from "gsap";
import type { Product } from "@/lib/products";
import type { Cart } from "@/lib/cart";
import { addProduct, removeProduct, submitCheckout } from "@/lib/actions";
import { ProductViewer } from "./ProductViewer";

type LandingClientProps = {
  products: Product[];
  cart: Cart;
  initialCount: number;
  initialTotal: number;
};

type CartState = {
  open: boolean;
  count: number;
  total: number;
  items: Cart;
};

type CheckoutState =
  | { phase: "idle" }
  | { phase: "form"; breaksEnabled: boolean }
  | { phase: "submitting" }
  | {
      phase: "confirmed";
      orderId: string;
      name: string;
      email: string;
      address: string;
    };

export function LandingClient({
  products,
  cart,
  initialCount,
  initialTotal,
}: LandingClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [cartState, setCartState] = useState<CartState>({
    open: false,
    count: initialCount,
    total: initialTotal,
    items: cart,
  });
  const [checkout, setCheckout] = useState<CheckoutState>({ phase: "idle" });
  const [, startTransition] = useTransition();
  const [shippingRate, setShippingRate] = useState<number | null>(null);

  // GSAP entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-animate='marquee']", {
        opacity: 0,
        y: -10,
        duration: 0.4,
        clearProps: "opacity,transform",
      });

      tl.from(
        "[data-animate='nav']",
        { opacity: 0, y: -10, duration: 0.5, clearProps: "opacity,transform" },
        "-=0.1",
      );

      tl.from(
        "[data-animate='hero']",
        { opacity: 0, scale: 0.98, duration: 0.6, clearProps: "opacity,transform" },
        "-=0.2",
      );

      tl.from(
        "[data-animate='feature']",
        {
          opacity: 0,
          x: -20,
          duration: 0.4,
          stagger: 0.06,
          clearProps: "opacity,transform",
        },
        "-=0.3",
      );

      tl.from(
        "[data-animate='card']",
        {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.08,
          clearProps: "opacity,transform",
        },
        "-=0.3",
      );

      tl.from(
        "[data-animate='footer']",
        { opacity: 0, duration: 0.4, clearProps: "opacity,transform" },
        "-=0.2",
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Invisible breaks — fire when checkout form opens
  useEffect(() => {
    if (checkout.phase !== "form") return;

    const breaksEnabled = checkout.breaksEnabled;

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
  }, [checkout]);

  // Shipping rates — fetch when checkout form opens
  useEffect(() => {
    if (checkout.phase !== "form") return;

    const breaksEnabled = checkout.breaksEnabled;
    const url = breaksEnabled ? "/api/shipping-rates?broken=1" : "/api/shipping-rates";

    fetch(url)
      .then((resp) => {
        if (!resp.ok) throw new Error(`Shipping API returned ${resp.status}`);
        return resp.json();
      })
      .then((data) => setShippingRate(data.rate ?? 5.99))
      .catch(() => setShippingRate(5.99));

    if (breaksEnabled) {
      const interval = setInterval(() => {
        fetch(url).catch(() => setShippingRate(5.99));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [checkout]);

  const handleAddToCart = (productId: string) => {
    startTransition(async () => {
      const result = await addProduct(productId);
      const product = products.find((p) => p.id === productId);
      if (product) {
        setCartState((prev) => {
          const existing = prev.items.find((i) => i.productId === productId);
          const items = existing
            ? prev.items.map((i) =>
                i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i,
              )
            : [
                ...prev.items,
                {
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  emoji: product.emoji,
                  quantity: 1,
                },
              ];
          return {
            ...prev,
            count: result.count,
            total: result.total,
            items,
          };
        });
      }
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    startTransition(async () => {
      const result = await removeProduct(productId);
      setCartState((prev) => ({
        ...prev,
        count: result.count,
        total: result.total,
        items: prev.items.filter((i) => i.productId !== productId),
      }));
    });
  };

  const handleCheckoutSubmit = (formData: FormData) => {
    setCheckout({ phase: "submitting" });
    startTransition(async () => {
      const result = await submitCheckout(formData);
      setCheckout({
        phase: "confirmed",
        orderId: result.orderId,
        name: result.name,
        email: result.email,
        address: result.address,
      });
      setCartState((prev) => ({
        ...prev,
        count: 0,
        total: 0,
        items: [],
      }));
    });
  };

  const otherProducts = products.filter((p) => p.id !== selectedProduct.id);

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen flex-col bg-arcade-cream text-ink-black font-arcade"
    >
      {/* Marquee Announcement Bar */}
      <div
        data-animate="marquee"
        className="marquee-sheen flex h-9 items-center justify-center px-4"
      >
        <p className="text-[14px] font-normal leading-[1.43] text-ink-black">
          KIN. STORE. COUPONS. FREE SHIPPING THROUGH SPACETIME.
        </p>
      </div>

      {/* Header Bar */}
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
            <button
              onClick={() => setCartState((prev) => ({ ...prev, open: true }))}
              className="rounded-[6px] border border-ink-black px-3 py-1 text-[14px] font-bold leading-[1.43] text-ink-black transition hover:bg-ink-black hover:text-arcade-cream"
            >
              BAG 〔{cartState.count}〕
            </button>
          </div>
        </div>
      </header>

      {/* Hero — 3D viewer + product info */}
      <section
        data-animate="hero"
        className="mx-auto mt-[44px] w-full max-w-[1200px] px-6"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[55%_1fr]">
          {/* Left — local 3D viewer (Three.js + react-three-fiber) */}
          <div className="relative h-[400px] overflow-hidden rounded-[12px] border border-ink-black bg-arcade-cream">
            <ProductViewer
              key={selectedProduct.id}
              modelUrl={selectedProduct.modelPath}
            />
          </div>

          {/* Right — product info, features, buy button */}
          <div className="flex flex-col justify-center">
            <h1 className="text-[18px] font-bold leading-[1.56] text-ink-black">
              {selectedProduct.name.toUpperCase()}
            </h1>
            <p className="mt-2 text-[16px] font-normal leading-[1.5] text-ink-black">
              {selectedProduct.description}
            </p>

            {/* Feature list */}
            <ul className="mt-4 space-y-1">
              {selectedProduct.features.map((feature, i) => (
                <li
                  key={i}
                  data-animate="feature"
                  className="text-[14px] font-normal leading-[1.43] text-ink-black"
                >
                  • {feature}
                </li>
              ))}
            </ul>

            {/* Buy button — green, the only green surface */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => handleAddToCart(selectedProduct.id)}
                className="rounded-[6px] bg-buy-green px-4 py-2 text-[14px] font-bold uppercase leading-[1.43] text-white shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-buy-green/90"
              >
                BUY 〔${selectedProduct.price.toFixed(2)}〕
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Product selector — click to swap the 3D viewer */}
      <section className="mx-auto mt-[44px] w-full max-w-[1200px] px-6">
        <h2 className="mb-4 text-[18px] font-bold leading-[1.56] text-ink-black">
          MORE GEAR
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {otherProducts.map((product) => (
            <button
              key={product.id}
              data-animate="card"
              onClick={() => setSelectedProduct(product)}
              className="rounded-[12px] border border-pixel-gray bg-arcade-cream p-3 text-left transition hover:border-ink-black"
            >
              {/* Thumbnail — emoji placeholder on cream */}
              <div className="flex h-24 items-center justify-center rounded-[12px] bg-arcade-cream border border-pixel-gray">
                <span className="text-[40px] leading-none">{product.emoji}</span>
              </div>
              <div className="mt-2 flex items-start justify-between">
                <h3 className="text-[14px] font-bold leading-[1.43] text-ink-black">
                  {product.name.toUpperCase()}
                </h3>
                <span className="text-[14px] font-normal leading-[1.43] text-ink-black">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[14px] font-normal leading-[1.43] text-ink-black">
                  VIEW IN 3D
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product.id);
                  }}
                  className="rounded-[6px] bg-buy-green px-3 py-1 text-[14px] font-bold uppercase leading-[1.43] text-white shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-buy-green/90"
                >
                  ADD TO CART
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Footer Strip */}
      <footer
        data-animate="footer"
        className="mt-[44px] border-t border-pixel-gray bg-arcade-cream px-6 py-4"
      >
        <div className="mx-auto max-w-[1200px] space-y-3">
          <div className="flex items-center justify-between">
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
          {/* 3D model attributions — required by CC licenses */}
          <div className="space-y-1">
            <p className="text-[10px] font-normal leading-[1.5] text-muted-gray">
              3D MODELS:
            </p>
            {products.map((p) => (
              <p key={p.id} className="text-[10px] font-normal leading-[1.5] text-muted-gray">
                {p.attribution}
              </p>
            ))}
          </div>
        </div>
      </footer>

      {/* === SLIDE-OUT CART PANEL === */}
      {cartState.open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink-black/40"
            onClick={() => setCartState((prev) => ({ ...prev, open: false }))}
          />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-ink-black bg-arcade-cream">
            {/* Cart header */}
            <div className="flex items-center justify-between border-b border-ink-black p-3">
              <h2 className="text-[18px] font-bold leading-[1.56] text-ink-black">
                BAG 〔{cartState.count}〕
              </h2>
              <button
                onClick={() => setCartState((prev) => ({ ...prev, open: false }))}
                className="rounded-[6px] border border-ink-black px-2 py-0.5 text-[14px] font-normal leading-[1.43] text-ink-black transition hover:bg-ink-black hover:text-arcade-cream"
              >
                CLOSE
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-3">
              {cartState.items.length === 0 ? (
                <p className="text-[16px] font-normal leading-[1.5] text-ink-black">
                  Your bag is empty.
                </p>
              ) : (
                <div className="space-y-2">
                  {cartState.items.map((item) => (
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
                      <button
                        onClick={() => handleRemoveFromCart(item.productId)}
                        className="rounded-[6px] border border-muted-gray px-2 py-0.5 text-[14px] font-normal leading-[1.43] text-muted-gray transition hover:border-ink-black hover:text-ink-black"
                      >
                        REMOVE
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart footer — total + checkout */}
            {cartState.items.length > 0 && checkout.phase === "idle" && (
              <div className="border-t border-pixel-gray p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[14px] font-normal leading-[1.43] text-ink-black">
                    TOTAL
                  </span>
                  <span className="text-[18px] font-bold leading-[1.56] text-ink-black">
                    ${cartState.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckout({ phase: "form", breaksEnabled: false })}
                    className="flex-1 rounded-[6px] bg-buy-green px-4 py-2 text-[14px] font-bold uppercase leading-[1.43] text-white shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-buy-green/90"
                  >
                    CHECKOUT
                  </button>
                  <button
                    onClick={() => setCheckout({ phase: "form", breaksEnabled: true })}
                    className="rounded-[6px] border border-ink-black bg-transparent px-3 py-2 text-[14px] font-normal leading-[1.43] text-ink-black shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-ink-black hover:text-arcade-cream"
                  >
                    ⚠ TRY INVISIBLE BREAKS
                  </button>
                </div>
              </div>
            )}

            {/* === CHECKOUT FORM === */}
            {checkout.phase === "form" && (
              <div className="border-t border-ink-black p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[18px] font-bold leading-[1.56] text-ink-black">
                    CHECKOUT
                  </h3>
                  <button
                    onClick={() => setCheckout({ phase: "idle" })}
                    className="rounded-[6px] border border-ink-black px-2 py-0.5 text-[14px] font-normal leading-[1.43] text-ink-black transition hover:bg-ink-black hover:text-arcade-cream"
                  >
                    BACK
                  </button>
                </div>

                {checkout.breaksEnabled && (
                  <div className="mb-3 space-y-2 rounded-[12px] border border-ink-black bg-arcade-cream p-3">
                    <p className="text-[14px] font-bold leading-[1.43] text-ink-black">
                      ⚠ INVISIBLE BREAKS ARE LIVE
                    </p>
                    <p className="text-[14px] font-normal leading-[1.43] text-ink-black">
                      This page looks normal. But behind the scenes:
                    </p>
                    <ul className="space-y-1 pl-3">
                      <li className="text-[14px] font-normal leading-[1.43] text-ink-black">
                        • Console errors are firing every 0.5s
                      </li>
                      <li className="text-[14px] font-normal leading-[1.43] text-ink-black">
                        • The shipping API is returning 500
                      </li>
                    </ul>
                    <p className="text-[14px] font-normal leading-[1.43] text-ink-black">
                      Screenshots and visual testing miss these. Kane CLI catches them.
                    </p>
                    <a
                      href="/dashboard"
                      className="block rounded-[6px] bg-buy-green px-3 py-2 text-center text-[14px] font-bold uppercase leading-[1.43] text-white shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-buy-green/90"
                    >
                      → SEE KANE CLI CATCH THEM
                    </a>
                    <p className="text-[10px] font-normal leading-[1.5] text-muted-gray">
                      Or open DevTools Console to see the errors yourself.
                    </p>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCheckoutSubmit(new FormData(e.currentTarget));
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="mb-1 block text-[14px] font-bold leading-[1.43] text-ink-black">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full rounded-[6px] border border-ink-black bg-arcade-cream px-3 py-2 text-[16px] font-normal leading-[1.5] text-ink-black outline-none"
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
                      className="w-full rounded-[6px] border border-ink-black bg-arcade-cream px-3 py-2 text-[16px] font-normal leading-[1.5] text-ink-black outline-none"
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
                      rows={2}
                      className="w-full rounded-[6px] border border-ink-black bg-arcade-cream px-3 py-2 text-[16px] font-normal leading-[1.5] text-ink-black outline-none"
                      placeholder="221B Baker Street, London"
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
                  <button
                    type="submit"
                    className="block w-full rounded-[6px] bg-buy-green px-4 py-2 text-[14px] font-bold uppercase leading-[1.43] text-white shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-buy-green/90"
                  >
                    COMPLETE ORDER
                  </button>
                </form>
              </div>
            )}

            {/* === SUBMITTING STATE === */}
            {checkout.phase === "submitting" && (
              <div className="border-t border-ink-black p-6">
                <p className="text-[16px] font-normal leading-[1.5] text-ink-black">
                  PROCESSING ORDER...
                </p>
              </div>
            )}

            {/* === CONFIRMATION STATE === */}
            {checkout.phase === "confirmed" && (
              <div className="border-t border-ink-black p-3">
                <h3 className="mb-3 text-[18px] font-bold leading-[1.56] text-ink-black">
                  ORDER CONFIRMED
                </h3>
                <p className="mb-4 text-[16px] font-normal leading-[1.5] text-ink-black">
                  Thank you, {checkout.name}. Your order is on its way.
                </p>
                <div className="space-y-2 rounded-[12px] border border-pixel-gray bg-arcade-cream p-3">
                  <div className="flex justify-between">
                    <span className="text-[14px] font-normal leading-[1.43] text-ink-black">
                      ORDER ID
                    </span>
                    <span className="text-[14px] font-bold leading-[1.43] text-ink-black">
                      {checkout.orderId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[14px] font-normal leading-[1.43] text-ink-black">
                      EMAIL
                    </span>
                    <span className="text-[14px] font-normal leading-[1.43] text-ink-black">
                      {checkout.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCheckout({ phase: "idle" });
                    setCartState((prev) => ({ ...prev, open: false }));
                  }}
                  className="mt-4 w-full rounded-[6px] border border-ink-black bg-transparent px-3 py-2 text-[14px] font-normal leading-[1.43] text-ink-black shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-ink-black hover:text-arcade-cream"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
