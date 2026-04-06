'use client';

import { useEffect, useState } from "react";
import { db } from "../../app/lib/firebase";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
} from "firebase/firestore";
import { logout } from "../../app/lib/authservice";
import { PRODUCT_CATEGORIES } from "../../app/lib/constants";

type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
  description: string;
  stock: number;
  imageUrl?: string;
  tag?: string;
};

const emptyForm = { name: "", price: "", category: "", description: "", stock: 0, imageUrl: "", tag: "" };

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [editingStock, setEditingStock] = useState<{ id: string; value: number } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.price || !form.category) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "products"), { ...form, stock: Number(form.stock) });
      setForm(emptyForm);
      await fetchProducts();
      setSuccess("Product added.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleStockSave = async (id: string) => {
    if (!editingStock) return;
    await updateDoc(doc(db, "products", id), { stock: editingStock.value });
    setEditingStock(null);
    await fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    await fetchProducts();
  };

  const handleLogout = async () => {
    await logout();
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    window.location.href = "/login";
  };

  const handleDrop = async (tag: string) => {
    if (!draggingId) return;
    await updateDoc(doc(db, "products", draggingId), { tag });
    setDraggingId(null);
    setDragOver(null);
    await fetchProducts();
  };

  const handleRemoveTag = async (id: string) => {
    await updateDoc(doc(db, "products", id), { tag: "" });
    await fetchProducts();
  };

  const stockColor = (stock: number) => {
    if (stock === 0) return "text-red-400";
    if (stock < 5) return "text-yellow-400";
    return "text-green-400";
  };

  const tagColor = (tag?: string) => {
    if (tag === "New") return "bg-white text-black";
    if (tag === "Popular") return "bg-purple-500 text-white";
    return "bg-zinc-700 text-white/40";
  };

  const lanes = [
    { tag: "New", label: "New Arrivals" },
    { tag: "Popular", label: "Most Popular" },
  ];

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40 mb-1" style={{ fontFamily: "Work Sans, sans-serif" }}>EmoStore</p>
            <h1 className="text-4xl uppercase tracking-wider" style={{ fontFamily: '"Courier New", monospace' }}>Admin</h1>
          </div>
          <button onClick={handleLogout} className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white hover:text-black transition">
            Sign Out
          </button>
        </div>

        {/* Add Product Form */}
        <section className="mb-16">
          <h2 className="text-xl uppercase tracking-wider mb-6" style={{ fontFamily: '"Courier New", monospace' }}>Add Product</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Product name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition placeholder:text-white/30" />
            <input type="text" placeholder="Price (e.g. $45)" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition placeholder:text-white/30" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition text-white/80">
              <option value="">Select category</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input type="number" placeholder="Stock quantity" value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition placeholder:text-white/30" />
            <textarea placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} className="sm:col-span-2 bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition placeholder:text-white/30 resize-none" />
            <input type="text" placeholder="Image URL (paste any image link)" value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="sm:col-span-2 bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition placeholder:text-white/30" />
            {form.imageUrl && (
              <div className="sm:col-span-2 h-48 rounded-xl overflow-hidden border border-white/10">
                <img src={form.imageUrl} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <button onClick={handleAdd} disabled={loading}
              className="rounded-full bg-white text-black px-6 py-2.5 text-sm font-medium transition hover:bg-white/80 disabled:opacity-50">
              {loading ? "Adding..." : "Add Product"}
            </button>
            {success && <p className="text-sm text-purple-400">{success}</p>}
          </div>
        </section>

        {/* Inventory Table */}
        <section className="mb-16">
          <h2 className="text-xl uppercase tracking-wider mb-6" style={{ fontFamily: '"Courier New", monospace' }}>
            Inventory — {products.length} items
          </h2>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-900">
                  <th className="text-left px-6 py-4 text-white/40 font-normal uppercase tracking-widest text-xs">Image</th>
                  <th className="text-left px-6 py-4 text-white/40 font-normal uppercase tracking-widest text-xs">Name</th>
                  <th className="text-left px-6 py-4 text-white/40 font-normal uppercase tracking-widest text-xs">Category</th>
                  <th className="text-left px-6 py-4 text-white/40 font-normal uppercase tracking-widest text-xs">Price</th>
                  <th className="text-left px-6 py-4 text-white/40 font-normal uppercase tracking-widest text-xs">Stock</th>
                  <th className="text-left px-6 py-4 text-white/40 font-normal uppercase tracking-widest text-xs">Tag</th>
                  <th className="text-left px-6 py-4 text-white/40 font-normal uppercase tracking-widest text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id}
                    draggable
                    onDragStart={() => setDraggingId(p.id)}
                    onDragEnd={() => { setDraggingId(null); setDragOver(null); }}
                    className={`border-b border-white/5 transition cursor-grab active:cursor-grabbing hover:bg-zinc-900/50 ${i % 2 === 0 ? "bg-black" : "bg-zinc-950"} ${draggingId === p.id ? "opacity-40" : ""}`}
                  >
                    <td className="px-6 py-4">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                        : <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-white/20 text-xs">No img</div>}
                    </td>
                    <td className="px-6 py-4 font-medium" style={{ fontFamily: '"Courier New", monospace' }}>{p.name}</td>
                    <td className="px-6 py-4 text-white/50">{p.category}</td>
                    <td className="px-6 py-4">{p.price}</td>
                    <td className="px-6 py-4">
                      {editingStock?.id === p.id ? (
                        <div className="flex items-center gap-2">
                          <input type="number" value={editingStock.value}
                            onChange={(e) => setEditingStock({ id: p.id, value: Number(e.target.value) })}
                            className="w-20 bg-zinc-800 border border-purple-400 rounded-lg px-2 py-1 text-sm outline-none" />
                          <button onClick={() => handleStockSave(p.id)} className="text-xs text-green-400 hover:text-green-300">Save</button>
                          <button onClick={() => setEditingStock(null)} className="text-xs text-white/40 hover:text-white">Cancel</button>
                        </div>
                      ) : (
                        <span className={`cursor-pointer ${stockColor(p.stock ?? 0)}`} onClick={() => setEditingStock({ id: p.id, value: p.stock ?? 0 })}>
                          {p.stock ?? 0}
                          {p.stock === 0 && <span className="text-xs text-red-400 ml-1">Out of stock</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest ${tagColor(p.tag)}`}>
                        {p.tag || "none"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(p.id)} className="text-xs text-white/30 hover:text-red-400 transition">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-white/30 text-sm">No products yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Drag to Tag Lanes */}
        <section>
          <h2 className="text-xl uppercase tracking-wider mb-2" style={{ fontFamily: '"Courier New", monospace' }}>Tag Lanes</h2>
          <p className="text-xs text-white/30 mb-6" style={{ fontFamily: "Work Sans, sans-serif" }}>
            Drag a product row from the table above and drop it into a lane to assign its tag.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lanes.map((lane) => (
              <div
                key={lane.tag}
                onDragOver={(e) => { e.preventDefault(); setDragOver(lane.tag); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(lane.tag)}
                className={`min-h-48 rounded-2xl border-2 border-dashed p-4 transition-all
                  ${dragOver === lane.tag ? "border-purple-400 bg-purple-400/5" : "border-white/10 bg-zinc-950"}`}
              >
                <p className="text-xs uppercase tracking-widest text-white/40 mb-4" style={{ fontFamily: "Work Sans, sans-serif" }}>
                  {lane.label}
                </p>
                <div className="flex flex-col gap-2">
                  {products.filter((p) => p.tag === lane.tag).map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-zinc-900 rounded-xl px-3 py-2 border border-white/5">
                      <div className="flex items-center gap-3">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                          : <div className="w-8 h-8 rounded-lg bg-zinc-800" />}
                        <span className="text-sm" style={{ fontFamily: '"Courier New", monospace' }}>{p.name}</span>
                      </div>
                      <button onClick={() => handleRemoveTag(p.id)} className="text-white/20 hover:text-red-400 text-xs transition ml-2">✕</button>
                    </div>
                  ))}
                  {products.filter((p) => p.tag === lane.tag).length === 0 && (
                    <p className="text-xs text-white/20 text-center py-6">Drop here</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}