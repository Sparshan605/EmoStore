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

type FormErrors = {
  name?: string;
  price?: string;
  category?: string;
  style?: string;
  description?: string;
  stock?: string;
  imageUrl?: string;
};

const STYLES = ["Emo", "Goth", "Punk", "Alt", "General"];
const DEFAULT_TAGS = ["New", "Popular"];

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

// ── Styles ────────────────────────────────────────────────────────────────────

const inputCls =
  "bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-400 transition placeholder:text-white/30 w-full";
const inputErrCls =
  "bg-zinc-900 border border-red-400/60 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-red-400 transition placeholder:text-white/30 w-full";
const selectCls =
  "bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm text-white/80 outline-none focus:border-purple-400 transition w-full";
const selectErrCls =
  "bg-zinc-900 border border-red-400/60 rounded-xl px-4 py-3 text-sm text-white/80 outline-none focus:border-red-400 transition w-full";

// ── Validation ────────────────────────────────────────────────────────────────

function validateForm(form: EditForm): FormErrors {
  const errors: FormErrors = {};

  // Name: required, min 2 chars, max 80 chars
  if (!form.name.trim()) {
    errors.name = "Product name is required.";
  } else if (form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (form.name.trim().length > 80) {
    errors.name = "Name must be 80 characters or fewer.";
  }

  // Price: required, valid number, positive, non-zero
  if (!form.price.trim()) {
    errors.price = "Price is required.";
  } else {
    const priceNum = parseFloat(form.price.replace(/[^\d.-]/g, ""));
    if (Number.isNaN(priceNum)) {
      errors.price = "Enter a valid price (e.g. $45 or 45.00).";
    } else if (priceNum < 0) {
      errors.price = "Price cannot be negative.";
    } else if (priceNum === 0) {
      errors.price = "Price must be greater than $0.";
    } else if (priceNum > 99999) {
      errors.price = "Price seems too high — max $99,999.";
    }
  }

  // Category: required
  if (!form.category) {
    errors.category = "Please select a category.";
  }

  // Style: required
  if (!form.style) {
    errors.style = "Please select a style.";
  }

  // Description: required, min 10 chars, max 500 chars
  if (!form.description.trim()) {
    errors.description = "Description is required.";
  } else if (form.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters.";
  } else if (form.description.trim().length > 500) {
    errors.description = "Description must be 500 characters or fewer.";
  }

  // Stock: non-negative integer, max 99999
  if (form.stock < 0) {
    errors.stock = "Stock cannot be negative.";
  } else if (!Number.isInteger(form.stock)) {
    errors.stock = "Stock must be a whole number.";
  } else if (form.stock > 99999) {
    errors.stock = "Stock quantity seems too high — max 99,999.";
  }

  // Image URL: required, must be a valid http/https URL
  if (!form.imageUrl || !form.imageUrl.trim()) {
    errors.imageUrl = "An image URL is required.";
  } else {
    try {
      const url = new URL(form.imageUrl.trim());
      if (!["http:", "https:"].includes(url.protocol)) {
        errors.imageUrl = "Image URL must start with http:// or https://.";
      }
    } catch {
      errors.imageUrl = "Enter a valid image URL (e.g. https://example.com/image.jpg).";
    }
  }

  return errors;
}

function hasErrors(errors: FormErrors) {
  return Object.keys(errors).length > 0;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-400" style={{ fontFamily: "Work Sans, sans-serif" }}>
      {message}
    </p>
  );
}

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
        <p className="mt-1.5 text-xs text-white/35" style={{ fontFamily: "Work Sans, sans-serif" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ProductFormFields({
  values,
  onChange,
  allTags,
  errors,
  touched,
  onTouch,
}: {
  values: EditForm;
  onChange: (v: EditForm) => void;
  allTags: string[];
  errors: FormErrors;
  touched: Set<string>;
  onTouch: (field: string) => void;
}) {
  const showErr = (field: string) =>
    touched.has(field) || touched.has("__submit__");

  const handlePriceChange = (raw: string) => {
    // Allow: optional leading $, digits, one decimal point — block negative sign
    if (/^(\$?)(\d*\.?\d*)$/.test(raw) || raw === "$") {
      onChange({ ...values, price: raw });
    }
  };

  const handleStockChange = (raw: string) => {
    const parsed = parseInt(raw, 10);
    const clamped = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    onChange({ ...values, stock: clamped });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

      {/* Name */}
      <div>
        <input
          type="text"
          placeholder="Product name *"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          onBlur={() => onTouch("name")}
          className={showErr("name") && errors.name ? inputErrCls : inputCls}
        />
        {showErr("name") && <FieldError message={errors.name} />}
      </div>

      {/* Price */}
      <div>
        <input
          type="text"
          placeholder="Price * (e.g. $45 or 45.00)"
          value={values.price}
          onChange={(e) => handlePriceChange(e.target.value)}
          onBlur={() => onTouch("price")}
          className={showErr("price") && errors.price ? inputErrCls : inputCls}
        />
        {showErr("price") && <FieldError message={errors.price} />}
      </div>

      {/* Category */}
      <div>
        <select
          value={values.category}
          onChange={(e) => onChange({ ...values, category: e.target.value })}
          onBlur={() => onTouch("category")}
          className={showErr("category") && errors.category ? selectErrCls : selectCls}
        >
          <option value="">Select category *</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {showErr("category") && <FieldError message={errors.category} />}
      </div>

      {/* Style */}
      <div>
        <select
          value={values.style}
          onChange={(e) => onChange({ ...values, style: e.target.value })}
          onBlur={() => onTouch("style")}
          className={showErr("style") && errors.style ? selectErrCls : selectCls}
        >
          <option value="">Select style * (Emo / Goth…)</option>
          {STYLES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {showErr("style") && <FieldError message={errors.style} />}
      </div>

      {/* Stock */}
      <div>
        <input
          type="number"
          placeholder="Stock quantity *"
          value={values.stock}
          min={0}
          max={99999}
          onChange={(e) => handleStockChange(e.target.value)}
          onBlur={() => onTouch("stock")}
          className={showErr("stock") && errors.stock ? inputErrCls : inputCls}
        />
        {showErr("stock") && <FieldError message={errors.stock} />}
      </div>

      {/* Tag (optional) */}
      <div>
        <select
          value={values.tag}
          onChange={(e) => onChange({ ...values, tag: e.target.value })}
          className={selectCls}
        >
          <option value="">No tag (optional)</option>
          {allTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="sm:col-span-2">
        <textarea
          placeholder="Description * (min 10 characters)"
          value={values.description}
          onChange={(e) => onChange({ ...values, description: e.target.value })}
          onBlur={() => onTouch("description")}
          rows={3}
          className={`${showErr("description") && errors.description ? inputErrCls : inputCls} resize-none`}
        />
        <div className="flex items-start justify-between mt-1">
          {showErr("description") ? (
            <FieldError message={errors.description} />
          ) : (
            <span />
          )}
          <span
            className={`text-xs ml-auto flex-shrink-0 ${values.description.length > 500 ? "text-red-400" : "text-white/25"}`}
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            {values.description.length}/500
          </span>
        </div>
      </div>

      {/* Image URL */}
      <div className="sm:col-span-2">
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Image URL * (https://…)"
              value={values.imageUrl ?? ""}
              onChange={(e) => onChange({ ...values, imageUrl: e.target.value })}
              onBlur={() => onTouch("imageUrl")}
              className={showErr("imageUrl") && errors.imageUrl ? inputErrCls : inputCls}
            />
            {showErr("imageUrl") && <FieldError message={errors.imageUrl} />}
          </div>
          {values.imageUrl && (
            <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-zinc-800">
              <img
                src={values.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const adminReady = useRequireAdmin();

  const [products, setProducts] = useState<Product[]>([]);

  // Add form state
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formTouched, setFormTouched] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState("");

  // Custom tags
  const [customTags, setCustomTags] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("emo_custom_tags") || "[]");
    } catch {
      return [];
    }
  });
  const [newTagInput, setNewTagInput] = useState("");

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(emptyForm);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [editTouched, setEditTouched] = useState<Set<string>>(new Set());
  const [editSaving, setEditSaving] = useState(false);

  const allTags = [...DEFAULT_TAGS, ...customTags];

  // Live-validate add form
  useEffect(() => {
    setFormErrors(validateForm(form));
  }, [form]);

  // Live-validate edit form
  useEffect(() => {
    setEditErrors(validateForm(editForm));
  }, [editForm]);

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    const items: Product[] = snap.docs.map((d) => {
      const { id: _ignore, ...data } = d.data() as Product;
      return { id: d.id, ...data };
    });
    setProducts(items);
  };

  useEffect(() => {
    if (adminReady) fetchProducts();
  }, [adminReady]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("emo_custom_tags", JSON.stringify(customTags));
    }
  }, [customTags]);

  // Mark every field as touched (used on submit attempt)
  const touchAll = (setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    setter(
      new Set([
        "name", "price", "category", "style",
        "description", "stock", "imageUrl", "__submit__",
      ])
    );
  };

  const handleAdd = async () => {
    touchAll(setFormTouched);
    const errors = validateForm(form);
    if (hasErrors(errors)) {
      setFormErrors(errors);
      return;
    }

    setAdding(true);
    try {
      await addDoc(collection(db, "products"), {
        ...form,
        stock: Number(form.stock),
      });
      setForm(emptyForm);
      setFormTouched(new Set());
      await fetchProducts();
      setAddSuccess("Product added successfully.");
      setTimeout(() => setAddSuccess(""), 3000);
    } catch (e) {
      console.error(e);
      setAddSuccess("Something went wrong. Please try again.");
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
    setEditTouched(new Set());
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
    touchAll(setEditTouched);
    const errors = validateForm(editForm);
    if (hasErrors(errors)) {
      setEditErrors(errors);
      return;
    }

    setEditSaving(true);
    try {
      await updateDoc(doc(db, "products", editingId), {
        ...editForm,
        stock: Number(editForm.stock),
      });
      setEditingId(null);
      setEditTouched(new Set());
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

  const addErrorCount = Object.keys(formErrors).length;
  const editErrorCount = Object.keys(editErrors).length;

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
          <SectionHeading
            title="Add Product"
            subtitle="Fields marked * are required. Price and stock cannot be negative."
          />
          <ProductFormFields
            values={form}
            onChange={setForm}
            allTags={allTags}
            errors={formErrors}
            touched={formTouched}
            onTouch={(field) =>
              setFormTouched((prev) => new Set([...prev, field]))
            }
          />

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              onClick={handleAdd}
              disabled={adding}
              className="rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-white/85 disabled:opacity-40 transition"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              {adding ? "Adding..." : "Add Product"}
            </button>

            {addSuccess && (
              <span
                className={`text-sm ${addSuccess.includes("wrong") ? "text-red-400" : "text-purple-400"}`}
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {addSuccess}
              </span>
            )}

            {formTouched.has("__submit__") && addErrorCount > 0 && (
              <span
                className="text-sm text-red-400"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {addErrorCount} field{addErrorCount !== 1 ? "s" : ""} need attention.
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
                          editingId === p.id
                            ? "bg-zinc-900 border-purple-400/20"
                            : i % 2 === 0
                            ? "bg-zinc-950"
                            : "bg-black"
                        }`}
                      >
                        {/* Image */}
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-zinc-800 flex-shrink-0">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-red-400/60 text-xs" title="No image">!</div>
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3">
                          <p className="truncate text-sm font-medium" style={{ fontFamily: '"Courier New", monospace' }}>
                            {p.name}
                          </p>
                        </td>

                        {/* Category / Style */}
                        <td className="px-4 py-3 text-white/50 truncate text-xs" style={{ fontFamily: "Work Sans, sans-serif" }}>
                          {p.category}{p.style ? ` · ${p.style}` : ""}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 text-sm truncate" style={{ fontFamily: '"Courier New", monospace' }}>
                          {p.price}
                        </td>

                        {/* Stock */}
                        <td className={`px-4 py-3 text-xs font-medium ${stockColor(p.stock ?? 0)}`} style={{ fontFamily: "Work Sans, sans-serif" }}>
                          {p.stock ?? 0}
                          {(p.stock ?? 0) === 0 && <span className="ml-1 text-red-400">OOS</span>}
                        </td>

                        {/* Tag */}
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs uppercase tracking-widest ${tagBadge(p.tag)}`}
                            style={{ fontFamily: "Work Sans, sans-serif" }}
                          >
                            {p.tag || "—"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                editingId === p.id ? setEditingId(null) : startEdit(p)
                              }
                              className={`text-xs border rounded-full px-3 py-1 transition ${
                                editingId === p.id
                                  ? "bg-purple-400 text-black border-purple-400"
                                  : "border-white/20 hover:bg-white/10"
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

                      {/* Inline edit row */}
                      {editingId === p.id && (
                        <tr className="bg-zinc-900 border-b border-purple-400/20">
                          <td colSpan={7} className="px-4 py-4">
                            <ProductFormFields
                              values={editForm}
                              onChange={setEditForm}
                              allTags={allTags}
                              errors={editErrors}
                              touched={editTouched}
                              onTouch={(field) =>
                                setEditTouched((prev) => new Set([...prev, field]))
                              }
                            />

                            {editTouched.has("__submit__") && editErrorCount > 0 && (
                              <p
                                className="mt-3 text-sm text-red-400"
                                style={{ fontFamily: "Work Sans, sans-serif" }}
                              >
                                {editErrorCount} field{editErrorCount !== 1 ? "s" : ""} need attention before saving.
                              </p>
                            )}

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
                                onClick={() => {
                                  setEditingId(null);
                                  setEditTouched(new Set());
                                }}
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