'use client';

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type Order = {
  id: string;
  userId?: string;
  userEmail?: string;
  items?: { name: string; quantity: number; price: string }[];
  total?: string | number;
  status?: string;
  createdAt?: any;
  note?: string;
  manual?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ORDER_STATUSES = ["Processing", "Paid", "Shipped", "Delivered", "Cancelled"];

const inputCls =
  "bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-400 transition placeholder:text-white/30 w-full";
const selectCls =
  "bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm text-white/80 outline-none focus:border-purple-400 transition w-full";

function formatTimestamp(value: any) {
  if (!value) return "—";
  let d: Date | null = null;
  if (typeof value?.toDate === "function") d = value.toDate();
  else if (value instanceof Date) d = value;
  else if (typeof value === "number") d = new Date(value);
  else if (typeof value === "object" && typeof value.seconds === "number") d = new Date(value.seconds * 1000);
  if (!d) return "—";
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

function formatCurrency(v?: string | number) {
  if (typeof v === "number") return `$${v.toFixed(2)}`;
  if (typeof v === "string") {
    if (v.startsWith("$")) return v;
    const n = Number(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? `$${n.toFixed(2)}` : v;
  }
  return "$0.00";
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? "").toLowerCase();
  const cls =
    s === "delivered" ? "bg-white text-black" :
    s === "shipped"   ? "bg-zinc-600 text-white" :
    s === "paid"      ? "bg-purple-500 text-white" :
    s === "cancelled" ? "bg-red-500/20 text-red-300 border border-red-400/30" :
                        "bg-zinc-800 text-white/50 border border-white/10";
  return (
    <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest ${cls}`} style={{ fontFamily: "Work Sans, sans-serif" }}>
      {status ?? "Processing"}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("All");

  const [showAddOrder, setShowAddOrder] = useState(false);
  const [manualOrder, setManualOrder] = useState({
    userEmail: "", userId: "", total: "", status: "Processing",
    note: "", itemName: "", itemQty: "1", itemPrice: "",
  });
  const [addingOrder, setAddingOrder] = useState(false);
  const [addOrderSuccess, setAddOrderSuccess] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
    } catch {
      const snap = await getDocs(collection(db, "orders"));
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "orders", id), { status });
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    } catch (e) { console.error(e); }
    setUpdatingId(null);
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    await deleteDoc(doc(db, "orders", id));
    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const addManualOrder = async () => {
    if (!manualOrder.userEmail && !manualOrder.userId) return;
    setAddingOrder(true);
    try {
      const items = manualOrder.itemName
        ? [{ name: manualOrder.itemName, quantity: Number(manualOrder.itemQty), price: manualOrder.itemPrice }]
        : [];
      await addDoc(collection(db, "orders"), {
        userId: manualOrder.userId || "manual",
        userEmail: manualOrder.userEmail,
        items,
        total: manualOrder.total,
        status: manualOrder.status,
        note: manualOrder.note,
        createdAt: serverTimestamp(),
        manual: true,
      });
      setManualOrder({ userEmail: "", userId: "", total: "", status: "Processing", note: "", itemName: "", itemQty: "1", itemPrice: "" });
      setShowAddOrder(false);
      setAddOrderSuccess("Order created.");
      setTimeout(() => setAddOrderSuccess(""), 3000);
      await fetchOrders();
    } catch (e) { console.error(e); }
    setAddingOrder(false);
  };

  const filteredOrders = filterStatus === "All"
    ? orders
    : orders.filter((o) => (o.status ?? "Processing") === filterStatus);

  return (
    <div>
      {/* Page heading */}
      <div className="mb-10 pb-6 border-b border-white/10">
        <p className="text-xs uppercase tracking-[0.35em] text-white/30 mb-1" style={{ fontFamily: "Work Sans, sans-serif" }}>
          Orders
        </p>
        <h2 className="text-4xl uppercase tracking-wider" style={{ fontFamily: '"Courier New", monospace' }}>
          Orders
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total",     value: orders.length },
          { label: "Pending",   value: orders.filter((o) => !o.status || o.status === "Processing" || o.status === "Paid").length },
          { label: "Delivered", value: orders.filter((o) => o.status === "Delivered").length },
          { label: "Cancelled", value: orders.filter((o) => o.status === "Cancelled").length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-2" style={{ fontFamily: "Work Sans, sans-serif" }}>{stat.label}</p>
            <p className="text-3xl" style={{ fontFamily: '"Courier New", monospace' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          {["All", ...ORDER_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-widest transition ${
                filterStatus === s ? "bg-white text-black" : "border border-white/20 text-white/50 hover:text-white"
              }`}
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {addOrderSuccess && <span className="text-sm text-purple-400" style={{ fontFamily: "Work Sans, sans-serif" }}>{addOrderSuccess}</span>}
          <button
            onClick={() => setShowAddOrder((v) => !v)}
            className={`rounded-full px-5 py-2 text-sm transition ${showAddOrder ? "border border-white/20 text-white/60 hover:text-white" : "bg-white text-black hover:bg-white/80"}`}
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            {showAddOrder ? "Cancel" : "+ New Order"}
          </button>
        </div>
      </div>

      {/* Manual order form */}
      {showAddOrder && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6 mb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-4" style={{ fontFamily: "Work Sans, sans-serif" }}>
            Create Manual Order
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <input type="text" placeholder="User email *" value={manualOrder.userEmail} onChange={(e) => setManualOrder({ ...manualOrder, userEmail: e.target.value })} className={inputCls} />
            <input type="text" placeholder="User ID (optional)" value={manualOrder.userId} onChange={(e) => setManualOrder({ ...manualOrder, userId: e.target.value })} className={inputCls} />
            <input type="text" placeholder="Item name" value={manualOrder.itemName} onChange={(e) => setManualOrder({ ...manualOrder, itemName: e.target.value })} className={inputCls} />
            <div className="flex gap-2">
              <input type="number" placeholder="Qty" value={manualOrder.itemQty} onChange={(e) => setManualOrder({ ...manualOrder, itemQty: e.target.value })} className={`${inputCls} w-24`} min={1} />
              <input type="text" placeholder="Item price (e.g. $45)" value={manualOrder.itemPrice} onChange={(e) => setManualOrder({ ...manualOrder, itemPrice: e.target.value })} className={inputCls} />
            </div>
            <input type="text" placeholder="Order total (e.g. 47.25)" value={manualOrder.total} onChange={(e) => setManualOrder({ ...manualOrder, total: e.target.value })} className={inputCls} />
            <select value={manualOrder.status} onChange={(e) => setManualOrder({ ...manualOrder, status: e.target.value })} className={selectCls}>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea placeholder="Internal note (optional)" value={manualOrder.note} onChange={(e) => setManualOrder({ ...manualOrder, note: e.target.value })} rows={2} className={`${inputCls} sm:col-span-2 resize-none`} />
          </div>
          <button
            onClick={addManualOrder}
            disabled={addingOrder || (!manualOrder.userEmail && !manualOrder.userId)}
            className="rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-white/85 disabled:opacity-40 transition"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            {addingOrder ? "Creating..." : "Create Order"}
          </button>
        </div>
      )}

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="rounded-2xl border border-white/10 bg-zinc-900 h-16 animate-pulse" />)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-white/10 bg-zinc-950">
          <p className="text-white/25 text-sm" style={{ fontFamily: "Work Sans, sans-serif" }}>
            {filterStatus === "All" ? "No orders yet." : `No ${filterStatus} orders.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className={`rounded-2xl border transition ${isExpanded ? "border-purple-400/30 bg-zinc-900" : "border-white/10 bg-zinc-950 hover:border-white/20"}`}>
                {/* Header */}
                <div
                  className="flex flex-wrap items-center gap-3 px-5 py-4 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <span className="text-sm font-medium w-28 flex-shrink-0" style={{ fontFamily: '"Courier New", monospace' }}>
                    EMO-{order.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs text-white/40 flex-1 min-w-0 truncate" style={{ fontFamily: "Work Sans, sans-serif" }}>
                    {order.userEmail ?? order.userId ?? "Unknown user"}
                  </span>
                  <span className="text-sm text-white/70 flex-shrink-0" style={{ fontFamily: '"Courier New", monospace' }}>
                    {formatCurrency(order.total)}
                  </span>
                  <span className="text-xs text-white/25 flex-shrink-0" style={{ fontFamily: "Work Sans, sans-serif" }}>
                    {formatTimestamp(order.createdAt)}
                  </span>
                  <StatusBadge status={order.status} />
                  {order.manual && (
                    <span className="rounded-full border border-yellow-400/30 px-2 py-0.5 text-xs text-yellow-300 uppercase tracking-widest flex-shrink-0" style={{ fontFamily: "Work Sans, sans-serif" }}>Manual</span>
                  )}
                  <span className="text-white/20 text-xs">{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-white/10 px-5 py-6">
                    <div className="grid sm:grid-cols-2 gap-8">
                      {/* Items */}
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-3" style={{ fontFamily: "Work Sans, sans-serif" }}>Items</p>
                        {(order.items && order.items.length > 0) ? (
                          <ul className="space-y-2">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="flex justify-between text-sm text-white/70" style={{ fontFamily: "Work Sans, sans-serif" }}>
                                <span>{item.name} <span className="text-white/30">×{item.quantity}</span></span>
                                <span>{item.price}</span>
                              </li>
                            ))}
                            <li className="flex justify-between text-sm font-medium pt-2 border-t border-white/10" style={{ fontFamily: '"Courier New", monospace' }}>
                              <span className="text-white/50">Total</span>
                              <span>{formatCurrency(order.total)}</span>
                            </li>
                          </ul>
                        ) : (
                          <p className="text-sm text-white/25" style={{ fontFamily: "Work Sans, sans-serif" }}>No items recorded.</p>
                        )}

                        {order.note && (
                          <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-3 py-2">
                            <p className="text-xs text-yellow-300/80" style={{ fontFamily: "Work Sans, sans-serif" }}>📝 {order.note}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-3" style={{ fontFamily: "Work Sans, sans-serif" }}>Update Status</p>
                        <div className="flex flex-wrap gap-2 mb-5">
                          {ORDER_STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id, s)}
                              disabled={updatingId === order.id}
                              className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-widest transition disabled:opacity-40 ${
                                order.status === s ? "bg-white text-black" : "border border-white/20 text-white/50 hover:border-white/50 hover:text-white"
                              }`}
                              style={{ fontFamily: "Work Sans, sans-serif" }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2 mb-5">
                          <button
                            onClick={() => updateStatus(order.id, "Paid")}
                            disabled={updatingId === order.id || order.status === "Paid" || order.status === "Delivered"}
                            className="flex-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-300 px-4 py-2 text-xs uppercase tracking-widest hover:bg-green-500/30 transition disabled:opacity-30"
                            style={{ fontFamily: "Work Sans, sans-serif" }}
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => updateStatus(order.id, "Cancelled")}
                            disabled={updatingId === order.id || order.status === "Cancelled"}
                            className="flex-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-2 text-xs uppercase tracking-widest hover:bg-red-500/30 transition disabled:opacity-30"
                            style={{ fontFamily: "Work Sans, sans-serif" }}
                          >
                            ✕ Cancel
                          </button>
                        </div>

                        <button onClick={() => deleteOrder(order.id)} className="text-xs text-red-400/40 hover:text-red-400 transition underline underline-offset-2" style={{ fontFamily: "Work Sans, sans-serif" }}>
                          Delete permanently
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}