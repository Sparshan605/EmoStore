import { db } from "./firebase";
import {
  collection, doc, setDoc, deleteDoc,
  getDocs, onSnapshot, serverTimestamp,
} from "firebase/firestore";

export type CartItem = {
  id: string;
  name: string;
  price: string;
  imageUrl?: string;
  category?: string;
  quantity: number;
};

// sync local cart to firestore
export async function syncCartToFirestore(uid: string, items: CartItem[]) {
  const cartRef = collection(db, "users", uid, "cart");
  for (const item of items) {
    await setDoc(doc(cartRef, item.id), item);
  }
}

// get cart from firestore
export async function getCartFromFirestore(uid: string): Promise<CartItem[]> {
  const snap = await getDocs(collection(db, "users", uid, "cart"));
  return snap.docs.map((d) => d.data() as CartItem);
}

// add item
export async function addToCart(uid: string, item: CartItem) {
  await setDoc(doc(db, "users", uid, "cart", item.id), item);
}

// remove item
export async function removeFromCart(uid: string, itemId: string) {
  await deleteDoc(doc(db, "users", uid, "cart", itemId));
}

// clear cart
export async function clearCart(uid: string) {
  const snap = await getDocs(collection(db, "users", uid, "cart"));
  for (const d of snap.docs) await deleteDoc(d.ref);
}

// listen to cart changes in real time
export function listenToCart(uid: string, callback: (items: CartItem[]) => void) {
  return onSnapshot(collection(db, "users", uid, "cart"), (snap) => {
    callback(snap.docs.map((d) => d.data() as CartItem));
  });
}