'use client';

import { useCart } from "../../app/lib/cartContext";
import { useRouter } from "next/navigation";
import { auth, db } from "../../app/lib/firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc, increment } from "firebase/firestore";
import { clearCart } from "../../app/lib/cartService";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearItems, total, count } = useCart();
  const router = useRouter();

  const handleCheckout = async () => {
    const user = auth.currentUser;
    if (!user) { router.push("/login"); return; }
    router.push("/checkout");

    try {
      // save order to firestore
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        total: total.toFixed(2),
        status: "Processing",
        createdAt: serverTimestamp(),
      });

      // decrement stock for each item
      for (const item of items) {
        await updateDoc(doc(db, "products", item.id), {
          stock: increment(-item.quantity),
        });
      }

      // clear cart
      await clearCart(user.uid);
      clearItems();

      router.push("/orders");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white mt-10">
        <section className="mx-auto max-w-4xl px-6 py-12 md:px-10">

          <div className="mb-12 border-b border-white/20 pb-8">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-white/60" style={{ fontFamily: "Work Sans, sans-serif" }}>
              Emo Store
            </p>
            <h1 className="text-5xl uppercase tracking-wider md:text-7xl" style={{ fontFamily: '"Courier New", monospace' }}>
              Cart
            </h1>
          </div>

          {items.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-white/40 text-lg mb-6" style={{ fontFamily: '"Courier New", monospace' }}>Your cart is empty.</p>
              <Link href="/shop" className="rounded-full border border-white/30 px-6 py-3 text-sm hover:bg-white hover:text-black transition" style={{ fontFamily: "Work Sans, sans-serif" }}>
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-12 lg:flex-row">

              {/* Items */}
              <div className="flex-1 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-2xl border border-white/10 bg-zinc-800 p-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-b from-zinc-700 to-zinc-900" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg uppercase tracking-wide" style={{ fontFamily: '"Courier New", monospace' }}>{item.name}</h3>
                      <p className="text-sm text-white/40 mb-3" style={{ fontFamily: "Work Sans, sans-serif" }}>{item.price}</p>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full border border-white/20 hover:bg-white hover:text-black transition text-sm">−</button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full border border-white/20 hover:bg-white hover:text-black transition text-sm">+</button>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-white/20 hover:text-red-400 transition text-xs self-start mt-1">✕</button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="w-full lg:w-72">
                <div className="rounded-2xl border border-white/10 bg-zinc-800 p-6 sticky top-24">
                  <h2 className="text-xl uppercase tracking-wider mb-6" style={{ fontFamily: '"Courier New", monospace' }}>Summary</h2>
                  <div className="space-y-3 mb-6 text-sm" style={{ fontFamily: "Work Sans, sans-serif" }}>
                    <div className="flex justify-between text-white/60">
                      <span>{count} items</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>Tax (5%)</span>
                      <span>${(total * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between text-white font-medium">
                      <span>Total</span>
                      <span>${(total * 1.05).toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full rounded-full bg-white text-black py-3 text-sm font-medium hover:bg-white/80 transition"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    Checkout
                  </button>
                  <Link href="/shop" className="block text-center mt-4 text-xs text-white/30 hover:text-white transition" style={{ fontFamily: "Work Sans, sans-serif" }}>
                    Continue Shopping
                  </Link>
                </div>
              </div>

            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}