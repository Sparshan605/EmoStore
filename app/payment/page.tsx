"use client";

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
import {
  collection,
  addDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import { clearCart } from "../lib/cartService";
import Navbar from "@/components/navbar";
import Link from "next/link";

// this loads stripe using publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// this is the checkout form inside Elements
function CheckoutForm({ total }: { total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, clearItems } = useCart();
  const router = useRouter();

  // loading state for button
  const [loading, setLoading] = useState(false);

  // error message state
  const [error, setError] = useState("");

  // this runs when user clicks pay button
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if stripe is not ready, stop here
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    // submit stripe elements first
    const { error: submitError } = await elements.submit();

    if (submitError) {
      setError(submitError.message ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    // create payment intent from api
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

    // confirm payment with stripe
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/orders`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed.");
      setLoading(false);
      return;
    }

    // get current logged in user
    const user = auth.currentUser;

    if (user) {
      // check stock before saving order
      for (const item of items) {
        const productSnap = await getDoc(doc(db, "products", item.id));

        if (!productSnap.exists()) {
          setError(`Product "${item.name}" no longer exists.`);
          setLoading(false);
          return;
        }

        const currentStock = productSnap.data().stock ?? 0;

        if (currentStock < item.quantity) {
          setError(
            `Sorry, "${item.name}" only has ${currentStock} left in stock.`
          );
          setLoading(false);
          return;
        }
      }

      // save order to firestore
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items: items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        total: total.toFixed(2),
        status: "Processing",
        createdAt: serverTimestamp(),
      });

      // update stock after order is saved
      for (const item of items) {
        await updateDoc(doc(db, "products", item.id), {
          stock: increment(-item.quantity),
        });
      }

      // clear cart from database
      await clearCart(user.uid);
    }

    // clear cart from local state
    clearItems();

    // go to orders page after payment
    router.push("/orders");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* stripe payment input */}
      <PaymentElement options={{ layout: "tabs" }} />

      {/* show error if there is one */}
      {error && (
        <p
          className="text-sm text-red-400"
          style={{ fontFamily: "Work Sans, sans-serif" }}
        >
          {error}
        </p>
      )}

      {/* payment button */}
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

// main checkout page
export default function CheckoutPage() {
  const { items, total, count } = useCart();
  const router = useRouter();

  // stripe client secret
  const [clientSecret, setClientSecret] = useState("");

  // loading for payment intent
  const [loadingIntent, setLoadingIntent] = useState(true);

  // add 5% tax to total
  const totalWithTax = parseFloat((total * 1.05).toFixed(2));

  useEffect(() => {
    // if cart is empty, go back to cart
    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    // if user is not logged in, go to login
    if (!auth.currentUser) {
      router.push("/login");
      return;
    }

    // create payment intent when page loads
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

  // stripe appearance options
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
          {/* page title */}
          <div className="mb-12 border-b border-white/20 pb-8">
            <p
              className="mb-3 text-sm uppercase tracking-[0.35em] text-white/60"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              Emo Store
            </p>

            <h1
              className="text-5xl uppercase tracking-wider md:text-7xl"
              style={{ fontFamily: '"Courier New", monospace' }}
            >
              Checkout
            </h1>
          </div>

          <div className="flex flex-col gap-10 lg:flex-row">
            {/* left side order summary */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="rounded-2xl border border-white/10 bg-zinc-800 p-6">
                <h2
                  className="text-lg uppercase tracking-wider mb-6"
                  style={{ fontFamily: '"Courier New", monospace' }}
                >
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {/* product image */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-700" />
                        )}
                      </div>

                      {/* product info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm uppercase truncate"
                          style={{ fontFamily: '"Courier New", monospace' }}
                        >
                          {item.name}
                        </p>

                        <p
                          className="text-xs text-white/40"
                          style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                          ×{item.quantity}
                        </p>
                      </div>

                      {/* product price */}
                      <span
                        className="text-sm flex-shrink-0"
                        style={{ fontFamily: '"Courier New", monospace' }}
                      >
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* price details */}
                <div
                  className="border-t border-white/10 pt-4 space-y-2 text-sm"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
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

              {/* back button */}
              <Link
                href="/cart"
                className="mt-4 block text-center text-xs text-white/30 hover:text-white transition"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                ← Back to Cart
              </Link>
            </div>

            {/* right side payment form */}
            <div className="flex-1">
              <div className="rounded-2xl border border-white/10 bg-zinc-800 p-6">
                <h2
                  className="text-lg uppercase tracking-wider mb-6"
                  style={{ fontFamily: '"Courier New", monospace' }}
                >
                  Payment
                </h2>

                {loadingIntent ? (
                  // loading skeleton
                  <div className="space-y-4 animate-pulse">
                    <div className="h-12 rounded-xl bg-zinc-700" />
                    <div className="h-12 rounded-xl bg-zinc-700" />
                    <div className="h-12 rounded-xl bg-zinc-700" />
                  </div>
                ) : clientSecret ? (
                  // stripe form
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <CheckoutForm total={totalWithTax} />
                  </Elements>
                ) : (
                  // error if payment does not load
                  <p
                    className="text-sm text-red-400"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    Failed to load payment. Please try again.
                  </p>
                )}

                {/* stripe test info */}
                <p
                  className="mt-6 text-xs text-white/20 text-center"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
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
