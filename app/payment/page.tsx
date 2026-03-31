"use client";

import { useState } from "react";
import Link from "next/link";

const cartItems = [
  { id: 1, name: "NEO Graphic Hoodie", price: 299 },
  { id: 2, name: "NEO Cargo Denim", price: 150 },
];

const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
const tax = Math.round(subtotal * 0.05);
const total = subtotal + tax;

export default function PaymentPage() {
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [success, setSuccess] = useState(false);

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
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">Payment Confirmed!</h2>
        <p className="text-gray-400 mb-6">
          Your order has been placed successfully.
        </p>
        <Link
          href="/"
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition"
        >
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className="text-gray-400 hover:text-white text-sm transition"
        >
          ← Back
        </Link>

        <h1 className="text-2xl font-bold mt-6 mb-6">Checkout</h1>

        {/* Order Summary */}
        <div className="bg-zinc-900 rounded-xl p-4 mb-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between py-2 border-b border-zinc-800 text-sm"
            >
              <span className="text-gray-300">{item.name}</span>
              <span>${item.price}</span>
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

        {/* Payment Form */}
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

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-xl transition"
          >
            Pay ${total}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-4">
          🔒 Secure payment
        </p>
      </div>
    </div>
  );
}
