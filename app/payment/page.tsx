'use client';

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "../lib/cartContext";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc, increment } from "firebase/firestore";
import { clearCart } from "../lib/cartService";
import Navbar from "@/components/navbar";
import Link from "next/link";


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ── inner form — must be INSIDE <Elements> so useStripe/useElements work
function CheckoutForm({ total }: { total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, clearItems } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total }),
    });

    const { clientSecret, error: apiError } = await res.json();
    if (apiError) {
      setError(apiError);
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: `${window.location.origin}/orders` },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed.");
      setLoading(false);
      return;
    }

    const user = auth.currentUser;
    if (user) {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        total: total.toFixed(2),
        status: "Processing",
        createdAt: serverTimestamp(),
      });

      for (const item of items) {
        await updateDoc(doc(db, "products", item.id), {
          stock: increment(-item.quantity),
        });
      }

      await clearCart(user.uid);
    }

    clearItems();
    router.push("/orders");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <p className="text-sm text-red-400" style={{ fontFamily: "Work Sans, sans-serif" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-full bg-white text-black py-3 text-sm font-medium hover:bg-white/80 transition disabled:opacity-50"
        style={{ fontFamily: "Work Sans, sans-serif" }}
      >
        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { items, total, count } = useCart();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState("");
  const [loadingIntent, setLoadingIntent] = useState(true);

  const totalWithTax = parseFloat((total * 1.05).toFixed(2));

  useEffect(() => {
    if (items.length === 0) { router.push("/cart"); return; }
    if (!auth.currentUser) { router.push("/login"); return; }

    fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalWithTax }),
    })
      .then((r) => r.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoadingIntent(false);
      })
      .catch(() => setLoadingIntent(false));
  }, []);

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: "night" as const,
      variables: {
        colorPrimary: "#a855f7",
        colorBackground: "#18181b",
        colorText: "#ffffff",
        colorDanger: "#f87171",
        fontFamily: "Work Sans, sans-serif",
        borderRadius: "12px",
      },
    },
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
              Checkout
            </h1>
          </div>

          <div className="flex flex-col gap-10 lg:flex-row">

            {/* Order Summary */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="rounded-2xl border border-white/10 bg-zinc-800 p-6">
                <h2 className="text-lg uppercase tracking-wider mb-6" style={{ fontFamily: '"Courier New", monospace' }}>
                  Order Summary
                </h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-zinc-700" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm uppercase truncate" style={{ fontFamily: '"Courier New", monospace' }}>{item.name}</p>
                        <p className="text-xs text-white/40" style={{ fontFamily: "Work Sans, sans-serif" }}>×{item.quantity}</p>
                      </div>
                      <span className="text-sm flex-shrink-0" style={{ fontFamily: '"Courier New", monospace' }}>{item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4 space-y-2 text-sm" style={{ fontFamily: "Work Sans, sans-serif" }}>
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal ({count} items)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Tax (5%)</span>
                    <span>${(total * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white font-medium pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>${totalWithTax.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/cart"
                className="mt-4 block text-center text-xs text-white/30 hover:text-white transition"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                ← Back to Cart
              </Link>
            </div>

            {/* Payment Form */}
            <div className="flex-1">
              <div className="rounded-2xl border border-white/10 bg-zinc-800 p-6">
                <h2 className="text-lg uppercase tracking-wider mb-6" style={{ fontFamily: '"Courier New", monospace' }}>
                  Payment
                </h2>

                {loadingIntent ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-12 rounded-xl bg-zinc-700" />
                    <div className="h-12 rounded-xl bg-zinc-700" />
                    <div className="h-12 rounded-xl bg-zinc-700" />
                  </div>
                ) : clientSecret ? (
                  // Elements wraps CheckoutForm here — only once
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <CheckoutForm total={totalWithTax} />
                  </Elements>
                ) : (
                  <p className="text-sm text-red-400" style={{ fontFamily: "Work Sans, sans-serif" }}>
                    Failed to load payment. Please try again.
                  </p>
                )}

                <p className="mt-6 text-xs text-white/20 text-center" style={{ fontFamily: "Work Sans, sans-serif" }}>
                  Secured by Stripe · Test card: 4242 4242 4242 4242
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>
    </>
  );
}