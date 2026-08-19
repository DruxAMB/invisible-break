"use server";

import { addToCart, removeFromCart } from "./cart";
import { redirect } from "next/navigation";

export async function addProduct(formData: FormData): Promise<void> {
  const productId = formData.get("productId");
  if (typeof productId === "string") {
    await addToCart(productId);
  }
  redirect("/cart");
}

export async function removeProduct(formData: FormData): Promise<void> {
  const productId = formData.get("productId");
  if (typeof productId === "string") {
    await removeFromCart(productId);
  }
}

export async function submitCheckout(formData: FormData): Promise<void> {
  const name = formData.get("name");
  const email = formData.get("email");
  const address = formData.get("address");

  // Store order info in a cookie for the confirmation page
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.set(
    "ib-order",
    JSON.stringify({
      orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
      name: String(name || ""),
      email: String(email || ""),
      address: String(address || ""),
    }),
    { httpOnly: true, sameSite: "lax", maxAge: 60 * 10, path: "/" }
  );

  // Fire-and-forget analytics call — this is the invisible break.
  // The /api/checkout-analytics endpoint returns 500, but because
  // this is a fire-and-forget fetch with no error handling on the
  // client side, the UI shows a successful checkout. The 500 only
  // shows up in the browser's network tab and console.
  // (See checkout/page.tsx for the client-side fetch that triggers this.)

  redirect("/confirmation");
}
