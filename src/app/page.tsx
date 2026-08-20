import { PRODUCTS } from "@/lib/products";
import { getCart, cartCount } from "@/lib/cart";
import { addProduct } from "@/lib/actions";
import { LandingClient } from "./LandingClient";

export default async function HomePage() {
  const cart = await getCart();
  const count = cartCount(cart);

  return (
    <LandingClient products={PRODUCTS} count={count} addProduct={addProduct} />
  );
}
