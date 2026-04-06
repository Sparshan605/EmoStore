import { getAuth } from "firebase/auth";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
};

function getKey(): string {
  if (typeof window === "undefined") return "emostore-cart-guest";
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  return uid ? `emostore-cart-${uid}` : "emostore-cart-guest";
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getKey(), JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(product: Omit<CartItem, "quantity">) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === product.id);
  if (existing) {
    existing.quantity += 1;
    saveCart(cart);
  } else {
    saveCart([...cart, { ...product, quantity: 1 }]);
  }
}

export function removeFromCart(id: string) {
  saveCart(getCart().filter((i) => i.id !== id));
}

export function updateQuantity(id: string, qty: number) {
  if (qty <= 0) return removeFromCart(id);
  saveCart(getCart().map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getKey());
  window.dispatchEvent(new Event("cart-updated"));
}
