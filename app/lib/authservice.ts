// lib/authService.ts
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

export async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  // fetch role from Firestore
  const snap = await getDoc(doc(db, "users", uid));
  const role = snap.exists() ? snap.data().role : "user"; // default user

  return { uid, role };
}

export async function logout() {
  await signOut(auth);
}