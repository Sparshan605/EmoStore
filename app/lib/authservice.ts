// lib/authService.ts
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

export async function login(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", cred.user.uid));
  const role = snap.data()?.role; // "admin" or "user"
  return { uid: cred.user.uid, role };
}

export async function logout() {
  await signOut(auth);
}