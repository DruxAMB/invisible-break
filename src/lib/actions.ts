"use server";

import { addToCart, removeFromCart, getCart, cartCount, cartTotal } from "./cart";

export async function addProduct(productId: string): Promise<{ count: number; total: number }> {
  await addToCart(productId);
  const cart = await getCart();
  return { count: cartCount(cart), total: cartTotal(cart) };
}

export async function removeProduct(productId: string): Promise<{ count: number; total: number }> {
  await removeFromCart(productId);
  const cart = await getCart();
  return { count: cartCount(cart), total: cartTotal(cart) };
}

export async function submitCheckout(formData: FormData): Promise<{
  orderId: string;
  name: string;
  email: string;
  address: string;
}> {
  const name = formData.get("name");
  const email = formData.get("email");
  const address = formData.get("address");

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
  cookieStore.set(
    "ib-order",
    JSON.stringify({
      orderId,
      name: String(name || ""),
      email: String(email || ""),
      address: String(address || ""),
    }),
    { httpOnly: true, sameSite: "lax", maxAge: 60 * 10, path: "/" }
  );

  return {
    orderId,
    name: String(name || ""),
    email: String(email || ""),
    address: String(address || ""),
  };
}

export async function getCartState(): Promise<{ count: number; total: number }> {
  const cart = await getCart();
  return { count: cartCount(cart), total: cartTotal(cart) };
}
