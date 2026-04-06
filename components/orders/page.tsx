'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { auth, db } from "../../app/lib/firebase";

type OrderDoc = {
  id: string;
  orderNumber?: string;
  status?: string;
  total?: string | number;
  subtotal?: string | number;
  tax?: string | number;
  createdAt?: any;
  date?: any;
  items?: any[];
  products?: any[];
  cartItems?: any[];
  userId?: string;
  uid?: string;
};

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":
      return "border-white/30 bg-white text-black";
    case "shipped":
      return "border-white/20 bg-zinc-700 text-white";
    case "processing":
    case "paid":
      return "border-white/20 bg-transparent text-white";
    case "cancelled":
      return "border-red-400/30 bg-red-500/10 text-red-200";
    default:
      return "border-white/20 bg-transparent text-white";
  }
}

function getTimestampValue(value: any) {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === "object" && typeof value.seconds === "number") {
    return value.seconds * 1000;
  }
  return 0;
}

function formatDate(rawOrder: OrderDoc) {
  const rawDate = rawOrder.createdAt ?? rawOrder.date;
  const timestamp = getTimestampValue(rawDate);

  if (!timestamp) return "Date unavailable";

  return new Date(timestamp).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(value: string | number | undefined) {
  if (typeof value === "number") return `$${value.toFixed(2)}`;
  if (typeof value === "string") {
    if (value.trim().startsWith("$")) return value;
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(parsed)) return `$${parsed.toFixed(2)}`;
    return value;
  }
  return "$0.00";
}

function getOrderItems(rawOrder: OrderDoc) {
  const source = rawOrder.items ?? rawOrder.products ?? rawOrder.cartItems ?? [];

  if (!Array.isArray(source)) return [];

  return source.map((item: any) => {
    if (typeof item === "string") return item;

    const name =
      item?.name ??
      item?.title ??
      item?.productName ??
      item?.product_title ??
      "Unnamed item";

    const quantity = item?.quantity ?? item?.qty ?? 1;

    return quantity > 1 ? `${name} ×${quantity}` : name;
  });
}

function getOrderNumber(rawOrder: OrderDoc) {
  return rawOrder.orderNumber ?? `EMO-${rawOrder.id.slice(-6).toUpperCase()}`;
}

function getOrderStatus(rawOrder: OrderDoc) {
  return rawOrder.status ?? "Processing";
}

function dedupeOrders(orders: OrderDoc[]) {
  const map = new Map<string, OrderDoc>();
  orders.forEach((order) => map.set(order.id, order));
  return Array.from(map.values());
}

export default function OrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const results: OrderDoc[] = [];

        const topLevelByUserId = await getDocs(
          query(collection(db, "orders"), where("userId", "==", user.uid))
        );

        results.push(
          ...topLevelByUserId.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as OrderDoc[]
        );

        const topLevelByUid = await getDocs(
          query(collection(db, "orders"), where("uid", "==", user.uid))
        );

        results.push(
          ...topLevelByUid.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as OrderDoc[]
        );

        if (results.length === 0) {
          const nestedOrders = await getDocs(collection(db, "users", user.uid, "orders"));

          results.push(
            ...nestedOrders.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as OrderDoc[]
          );
        }

        if (!cancelled) {
          setOrders(dedupeOrders(results));
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
        if (!cancelled) {
          setError("Could not load your order history right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aTime = getTimestampValue(a.createdAt ?? a.date);
      const bTime = getTimestampValue(b.createdAt ?? b.date);
      return bTime - aTime;
    });
  }, [orders]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white mt-10">
        <section className="mx-auto max-w-6xl px-6 py-12 md:px-10 lg:px-12">
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
              Orders
            </h1>

            <p
              className="mt-5 max-w-2xl text-base leading-7 text-white/80 md:text-lg"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              Your personal order history, pulled from Firestore and shown only for
              the logged-in user.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <p
              className="text-sm text-white/40"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              {loading
                ? "Loading orders..."
                : `${sortedOrders.length} order${sortedOrders.length === 1 ? "" : "s"}`}
            </p>

            <Link
              href="/shop"
              className="rounded-full border border-white/30 px-5 py-2 text-sm transition hover:bg-white hover:text-black"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              Back to Shop
            </Link>
          </div>

          {!authReady || loading ? (
            <div className="space-y-5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-zinc-800 p-6 animate-pulse"
                >
                  <div className="mb-4 h-5 w-1/3 rounded bg-zinc-700" />
                  <div className="mb-6 h-4 w-1/4 rounded bg-zinc-700" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 h-3 w-16 rounded bg-zinc-700" />
                      <div className="h-4 w-full rounded bg-zinc-700" />
                    </div>
                    <div>
                      <div className="mb-2 h-3 w-16 rounded bg-zinc-700" />
                      <div className="h-6 w-24 rounded bg-zinc-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !user ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900 px-6 py-16 text-center">
              <p
                className="text-lg text-white/75"
                style={{ fontFamily: '"Courier New", monospace' }}
              >
                Sign in to view your orders.
              </p>
              <p
                className="mt-3 text-sm text-white/40"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                Your order history is tied to the currently logged-in account.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block rounded-full border border-white/25 px-5 py-2 text-sm transition hover:bg-white hover:text-black"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                Go to Login
              </Link>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-6 py-12 text-center">
              <p
                className="text-base text-red-200"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full border border-white/25 px-5 py-2 text-sm transition hover:bg-white hover:text-black"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                Try Again
              </button>
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900 px-6 py-16 text-center">
              <p
                className="text-lg text-white/75"
                style={{ fontFamily: '"Courier New", monospace' }}
              >
                No orders yet.
              </p>
              <p
                className="mt-3 text-sm text-white/40"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                Once checkout is connected, completed purchases will appear here.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-block rounded-full border border-white/25 px-5 py-2 text-sm transition hover:bg-white hover:text-black"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {sortedOrders.map((order) => {
                const items = getOrderItems(order);
                const status = getOrderStatus(order);

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-white/10 bg-zinc-800 p-6"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2
                          className="text-2xl uppercase tracking-wide"
                          style={{ fontFamily: '"Courier New", monospace' }}
                        >
                          {getOrderNumber(order)}
                        </h2>

                        <p
                          className="mt-2 text-sm text-white/65"
                          style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                          Placed on {formatDate(order)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] ${getStatusClasses(
                          status
                        )}`}
                        style={{ fontFamily: "Work Sans, sans-serif" }}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
                      <div>
                        <p
                          className="mb-2 text-xs uppercase tracking-[0.22em] text-white/50"
                          style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                          Items
                        </p>

                        {items.length > 0 ? (
                          <ul
                            className="space-y-2 text-sm leading-7 text-white/80"
                            style={{ fontFamily: "Work Sans, sans-serif" }}
                          >
                            {items.map((item, index) => (
                              <li key={`${order.id}-${index}`}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p
                            className="text-sm leading-7 text-white/45"
                            style={{ fontFamily: "Work Sans, sans-serif" }}
                          >
                            No item list was stored for this order.
                          </p>
                        )}
                      </div>

                      <div>
                        <p
                          className="mb-2 text-xs uppercase tracking-[0.22em] text-white/50"
                          style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                          Total
                        </p>
                        <p
                          className="text-2xl"
                          style={{ fontFamily: '"Courier New", monospace' }}
                        >
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}