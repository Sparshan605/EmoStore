'use client';

import React, { useEffect, useState } from "react";
import { db } from "../../app/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useRequireAdmin } from "../../app/protectedRoute";
import { logout } from "../../app/lib/authservice";
import { PRODUCT_CATEGORIES } from "../../app/lib/constants";
import "@/app/globals.css";

type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
  style: string;
  description: string;
  stock: number;
  imageUrl?: string;
  tag?: string;
};

type EditForm = Omit<Product, "id">;

const STYLES = ["Emo", "Goth", "Punk", "Alt", "General"];
const DEFAULT_TAGS = ["New", "Popular"];

const inputCls =
  "bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-400 transition placeholder:text-white/30 w-full";
const selectCls =
  "bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm text-white/80 outline-none focus:border-purple-400 transition w-full";

const emptyForm: EditForm = {
  name: "",
  price: "",
  category: "",
  style: "",
  description: "",
  stock: 0,
  imageUrl: "",
  tag: "",
};

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-white/10">
      <h2
        className="text-xl uppercase tracking-wider text-white"
        style={{ fontFamily: '"Courier New", monospace' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-1.5 text-xs text-white/35"
          style={{ fontFamily: "Work Sans, sans-serif" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function AdminPage() {

  const adminReady = useRequireAdmin();

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState("");
  
  
  

  // replace your loading state check with:
  
  const [customTags, setCustomTags] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("emo_custom_tags") || "[]");
    } catch {
      return [];
    }
  });
  const [newTagInput, setNewTagInput] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(emptyForm);
  const [editSaving, setEditSaving] = useState(false);

  const allTags = [...DEFAULT_TAGS, ...customTags];

  // Fetch all products
  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    const items: Product[] = snap.docs.map((d) => {
    const { id: _ignore, ...data } = d.data() as Product; // remove any `id` inside the doc
    return { id: d.id, ...data }; // use Firestore doc id

  });
  setProducts(items);
};

  useEffect(() => {
  if (adminReady) fetchProducts();
}, [adminReady]);

  // Persist custom tags
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("emo_custom_tags", JSON.stringify(customTags));
    }
  }, [customTags]);

  const handleAdd = async () => {
    if (!form.name || !form.price || !form.category) return;
    setAdding(true);
    try {
      await addDoc(collection(db, "products"), { ...form, stock: Number(form.stock) });
      setForm(emptyForm);
      await fetchProducts();
      setAddSuccess("Product added.");
      setTimeout(() => setAddSuccess(""), 3000);
    } catch (e) {
      console.error(e);
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    if (editingId === id) setEditingId(null);
    await fetchProducts();
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      price: p.price,
      category: p.category,
      style: p.style ?? "",
      description: p.description,
      stock: p.stock,
      imageUrl: p.imageUrl ?? "",
      tag: p.tag ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setEditSaving(true);
    try {
      await updateDoc(doc(db, "products", editingId), { ...editForm, stock: Number(editForm.stock) });
      setEditingId(null);
      await fetchProducts();
    } catch (e) {
      console.error(e);
    }
    setEditSaving(false);
  };

  const addCustomTag = () => {
    const t = newTagInput.trim();
    if (!t || allTags.map((x) => x.toLowerCase()).includes(t.toLowerCase())) return;
    setCustomTags((prev) => [...prev, t]);
    setNewTagInput("");
  };

  const handleLogout = async () => {
    await logout();
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    window.location.href = "/login";
  };

  const stockColor = (stock: number) => {
    if (stock === 0) return "text-red-400";
    if (stock < 5) return "text-yellow-400";
    return "text-green-400";
  };

  const tagBadge = (tag?: string) => {
    if (tag === "New") return "bg-white text-black";
    if (tag === "Popular") return "bg-purple-500 text-white";
    if (tag) return "bg-zinc-600 text-white";
    return "bg-zinc-800 text-white/30";
  };

  function ProductFormFields({
    values,
    onChange,
    allTags,
  }: {
    values: EditForm;
    onChange: (v: EditForm) => void;
    allTags: string[];
  }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Product name"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          className={inputCls}
        />
        <input
          type="text"
          placeholder="Price (e.g. $45)"
          value={values.price}
          onChange={(e) => onChange({ ...values, price: e.target.value })}
          className={inputCls}
        />
        <select
          value={values.category}
          onChange={(e) => onChange({ ...values, category: e.target.value })}
          className={selectCls}
        >
          <option value="">Select category</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={values.style}
          onChange={(e) => onChange({ ...values, style: e.target.value })}
          className={selectCls}
        >
          <option value="">Select style (Emo / Goth…)</option>
          {STYLES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Stock quantity"
          value={values.stock}
          onChange={(e) => onChange({ ...values, stock: Number(e.target.value) })}
          className={inputCls}
        />
        <select
          value={values.tag}
          onChange={(e) => onChange({ ...values, tag: e.target.value })}
          className={selectCls}
        >
          <option value="">No tag</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Description"
          value={values.description}
          onChange={(e) => onChange({ ...values, description: e.target.value })}
          rows={3}
          className={`${inputCls} sm:col-span-2 resize-none`}
        />
        <div className="sm:col-span-2 flex gap-3 items-start">
          <input
            type="text"
            placeholder="Image URL"
            value={values.imageUrl ?? ""}
            onChange={(e) => onChange({ ...values, imageUrl: e.target.value })}
            className={inputCls}
          />
          {values.imageUrl && (
            <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-zinc-800">
              <img src={values.imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!adminReady) return <p className="text-white p-6">Loading...</p>;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 md:px-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-16 pb-6 border-b border-white/10">
          <div>
            <p
              className="text-xs uppercase tracking-[0.35em] text-white/30 mb-1"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              EmoStore
            </p>
            <h1
              className="text-4xl uppercase tracking-wider"
              style={{ fontFamily: '"Courier New", monospace' }}
            >
              Admin
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-white/20 px-5 py-2 text-sm hover:bg-white hover:text-black transition"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Sign Out
          </button>
        </div>

        {/* Tag Manager */}
        <section className="mb-16">
          <SectionHeading
            title="Tags"
            subtitle="Built-in: New, Popular. Add custom tags — they appear in every tag dropdown."
          />
          <div className="flex flex-wrap gap-2 mb-5">
            {DEFAULT_TAGS.map((t) => (
              <span
                key={t}
                className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest ${tagBadge(t)}`}
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {t}
              </span>
            ))}
            {customTags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-widest text-white/60"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {t}
                <button
                  onClick={() => setCustomTags((prev) => prev.filter((x) => x !== t))}
                  className="text-white/25 hover:text-red-400 transition ml-0.5"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-3 max-w-xs">
            <input
              type="text"
              placeholder="New tag name..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
              className={inputCls}
            />
            <button
              onClick={addCustomTag}
              className="rounded-full border border-white/25 px-5 py-2 text-sm hover:bg-white hover:text-black transition flex-shrink-0"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              Add
            </button>
          </div>
        </section>

        {/* Add Product */}
        <section className="mb-16">
          <SectionHeading title="Add Product" />
          <ProductFormFields values={form} onChange={setForm} allTags={allTags} />
          <div className="mt-5 flex items-center gap-4">
            <button
              onClick={handleAdd}
              disabled={adding}
              className="rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-white/85 disabled:opacity-40 transition"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              {adding ? "Adding..." : "Add Product"}
            </button>
            {addSuccess && (
              <span className="text-sm text-purple-400" style={{ fontFamily: "Work Sans, sans-serif" }}>
                {addSuccess}
              </span>
            )}
          </div>
        </section>

        {/* Inventory */}
        <section>
          <SectionHeading title={`Inventory — ${products.length} items`} />
          {products.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-white/10 bg-zinc-950">
              <p className="text-white/25 text-sm" style={{ fontFamily: "Work Sans, sans-serif" }}>
                No products yet. Add one above.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm" style={{ tableLayout: "fixed", minWidth: "640px" }}>
                <colgroup>
                  <col style={{ width: "56px" }} />
                  <col style={{ width: "30%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "13%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900">
                    {["Img", "Name", "Category", "Price", "Stock", "Tag", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-white/40 font-normal uppercase tracking-widest text-xs"
                        style={{ fontFamily: "Work Sans, sans-serif" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <React.Fragment key={p.id}>
                      <tr
                        className={`border-b border-white/5 hover:bg-zinc-900/60 transition ${
                          editingId === p.id ? "bg-zinc-900 border-purple-400/20" : i % 2 === 0 ? "bg-zinc-950" : "bg-black"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-zinc-800 flex-shrink-0">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">?</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="truncate text-sm font-medium" style={{ fontFamily: '"Courier New", monospace' }}>
                            {p.name}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-white/50 truncate text-xs" style={{ fontFamily: "Work Sans, sans-serif" }}>
                          {p.category}{p.style ? ` · ${p.style}` : ""}
                        </td>
                        <td className="px-4 py-3 text-sm truncate" style={{ fontFamily: '"Courier New", monospace' }}>
                          {p.price}
                        </td>
                        <td className={`px-4 py-3 text-xs font-medium ${stockColor(p.stock ?? 0)}`} style={{ fontFamily: "Work Sans, sans-serif" }}>
                          {p.stock ?? 0}
                          {(p.stock ?? 0) === 0 && <span className="ml-1 text-red-400">OOS</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs uppercase tracking-widest ${tagBadge(p.tag)}`}
                            style={{ fontFamily: "Work Sans, sans-serif" }}
                          >
                            {p.tag || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => (editingId === p.id ? setEditingId(null) : startEdit(p))}
                              className={`text-xs border rounded-full px-3 py-1 transition ${
                                editingId === p.id ? "bg-purple-400 text-black border-purple-400" : "border-white/20 hover:bg-white/10"
                              }`}
                              style={{ fontFamily: "Work Sans, sans-serif" }}
                            >
                              {editingId === p.id ? "Cancel" : "Edit"}
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="text-xs border border-red-500 text-red-400 rounded-full px-3 py-1 hover:bg-red-500/20 transition"
                              style={{ fontFamily: "Work Sans, sans-serif" }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>

                      {editingId === p.id && (
                        <tr className="bg-zinc-900 border-b border-purple-400/20">
                          <td colSpan={7} className="px-4 py-4">
                            <ProductFormFields values={editForm} onChange={setEditForm} allTags={allTags} />
                            <div className="mt-4 flex items-center gap-3">
                              <button
                                onClick={saveEdit}
                                disabled={editSaving}
                                className="rounded-full bg-purple-400 text-black px-5 py-2.5 text-sm font-medium hover:bg-purple-500 disabled:opacity-40 transition"
                                style={{ fontFamily: "Work Sans, sans-serif" }}
                              >
                                {editSaving ? "Saving..." : "Save Changes"}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="rounded-full border border-white/20 px-5 py-2.5 text-sm hover:bg-white/10 transition"
                                style={{ fontFamily: "Work Sans, sans-serif" }}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}