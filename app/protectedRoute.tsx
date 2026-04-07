
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";

export function useRequireAuth() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { window.location.replace("/login"); return; }
      setReady(true);
    });
    return () => unsub();
  }, []);

  return ready;
}


export function useRequireAdmin() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.replace("/login"); return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      const role = snap.data()?.role ?? "user";
      if (role !== "admin") { window.location.replace("/login"); return; }
      setReady(true);
    });
    return () => unsub();
  }, []);

  return ready;
}