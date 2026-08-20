import { PRODUCTS } from "@/lib/products";
import { getCart, cartCount, cartTotal } from "@/lib/cart";
import { LandingClient } from "./LandingClient";

export default async function HomePage() {
  const cart = await getCart();
  const count = cartCount(cart);
  const total = cartTotal(cart);

  return (
    <LandingClient
      products={PRODUCTS}
      cart={cart}
      initialCount={count}
      initialTotal={total}
    />
  );
}
