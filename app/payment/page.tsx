"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  type CartItem,
} from "@/app/_services/cartStore";

export default function PaymentPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCart(getCart());
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  function handleRemove(id: string) {
    removeFromCart(id);
    setCart(getCart());
  }

  function handleQty(id: string, delta: number) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    updateQuantity(id, item.quantity + delta);
    setCart(getCart());
  }

  function handleCardNumber(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
  }

  function handleExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    setExpiry(
      digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (cardNumber.replace(/\s/g, "").length < 16) {
      setError("Please enter a valid 16-digit card number.");
      return;
    }
    if (expiry.replace(/\D/g, "").length < 4) {
      setError("Please enter a valid expiry date.");
      return;
    }
    if (cvv.length < 3) {
      setError("Please enter a valid CVV.");
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      clearCart();
      setProcessing(false);
      setSuccess(true);
    }, 1800);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-5">
        <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-4xl animate-bounce">
          ✓
        </div>
        <h2 className="text-3xl font-bold">Payment Successful!</h2>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          Your order has been confirmed. You'll receive a confirmation shortly.
        </p>
        <Link
          href="/shop"
          className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
        <p className="text-gray-400 text-sm">Your cart is empty.</p>
        <Link
          href="/shop"
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-xl transition text-sm"
        >
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-md mx-auto">
        <Link
          href="/shop"
          className="text-gray-400 hover:text-white text-sm transition"
        >
          ← Back
        </Link>

        <h1 className="text-2xl font-bold mt-6 mb-6">Checkout</h1>

        <div className="bg-zinc-900 rounded-xl p-4 mb-6">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-2 border-b border-zinc-800 text-sm gap-2"
            >
              <div className="flex-1">
                <span className="text-gray-300">{item.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleQty(item.id, -1)}
                    className="w-5 h-5 rounded-full bg-zinc-700 hover:bg-zinc-600 text-xs flex items-center justify-center transition"
                  >
                    −
                  </button>
                  <span className="text-gray-400 text-xs">{item.quantity}</span>
                  <button
                    onClick={() => handleQty(item.id, +1)}
                    className="w-5 h-5 rounded-full bg-zinc-700 hover:bg-zinc-600 text-xs flex items-center justify-center transition"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-xs text-zinc-600 hover:text-red-400 transition ml-1 underline"
                  >
                    remove
                  </button>
                </div>
              </div>
              <span className="font-mono">${item.price * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 border-b border-zinc-800 text-sm">
            <span className="text-gray-400">Tax (5%)</span>
            <span className="text-gray-400">${tax}</span>
          </div>
          <div className="flex justify-between pt-3 font-bold">
            <span>Total</span>
            <span className="text-purple-400">${total}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Cardholder Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
          />
          <input
            type="text"
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => handleCardNumber(e.target.value)}
            required
            inputMode="numeric"
            maxLength={19}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => handleExpiry(e.target.value)}
              required
              inputMode="numeric"
              maxLength={5}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
            <input
              type="password"
              placeholder="CVV"
              value={cvv}
              onChange={(e) =>
                setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              required
              inputMode="numeric"
              maxLength={4}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
          >
            {processing ? "Processing…" : `Pay $${total}`}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-4">
          🔒 Secure payment
        </p>
      </div>
    </div>
  );
}
