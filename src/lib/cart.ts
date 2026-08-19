import { cookies } from "next/headers";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  emoji: string;
  quantity: number;
};

export type Cart = CartItem[];

const CART_COOKIE = "ib-cart";

export async function getCart(): Promise<Cart> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Cart;
  } catch {
    return [];
  }
}

export async function saveCart(cart: Cart): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}

export async function addToCart(productId: string): Promise<Cart> {
  const cart = await getCart();
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    const { getProduct } = await import("./products");
    const product = getProduct(productId);
    if (!product) return cart;
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      quantity: 1,
    });
  }
  await saveCart(cart);
  return cart;
}

export async function removeFromCart(productId: string): Promise<Cart> {
  const cart = await getCart();
  const filtered = cart.filter((item) => item.productId !== productId);
  await saveCart(filtered);
  return filtered;
}

export function cartTotal(cart: Cart): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartCount(cart: Cart): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
