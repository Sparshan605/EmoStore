'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import {
  CartItem, addToCart, removeFromCart,
  listenToCart, syncCartToFirestore, getCartFromFirestore,
} from "./cartService";

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearItems: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearItems: () => {},
  total: 0,
  count: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  const loadLocal = (): CartItem[] => {
    try {
      return JSON.parse(localStorage.getItem("cart") ?? "[]");
    } catch {
      return [];
    }
  };

  const saveLocal = (cartItems: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const local = loadLocal();
        const remote = await getCartFromFirestore(user.uid);
        const merged = [...remote];

        for (const localItem of local) {
          const exists = merged.find((r) => r.id === localItem.id);
          if (!exists) merged.push(localItem);
          else exists.quantity += localItem.quantity;
        }

        if (local.length > 0) {
          await syncCartToFirestore(user.uid, merged);
          localStorage.removeItem("cart");
        }

        const unsubCart = listenToCart(user.uid, setItems);
        return () => unsubCart();
      } else {
        setUid(null);
        setItems(loadLocal());
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) saveLocal(items);
  }, [items, uid]);

  const addItem = async (product: Omit<CartItem, "quantity">) => {
    const existing = items.find((i) => i.id === product.id);
    const newItem: CartItem = existing
      ? { ...existing, quantity: existing.quantity + 1 }
      : { ...product, quantity: 1 };

    if (uid) {
      await addToCart(uid, newItem);
    } else {
      setItems((prev) => {
        const exists = prev.find((i) => i.id === product.id);
        if (exists) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        return [...prev, { ...product, quantity: 1 }];
      });
    }
  };

  const removeItem = async (id: string) => {
    if (uid) {
      await removeFromCart(uid, id);
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) { removeItem(id); return; }
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const updated = { ...item, quantity };
    if (uid) {
      await addToCart(uid, updated);
    } else {
      setItems((prev) => prev.map((i) => i.id === id ? updated : i));
    }
  };

  const clearItems = () => {
    setItems([]);
    if (!uid) localStorage.removeItem("cart");
  };

  const total = items.reduce((sum, i) => {
    const price = parseFloat(i.price.replace(/[^0-9.]/g, ""));
    return sum + price * i.quantity;
  }, 0);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearItems, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}