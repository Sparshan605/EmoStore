"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "@/app/lib/cartContext";
import { SHOP_CATEGORIES } from "@/app/lib/constants";

type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
  description: string;
  stock: number;
  imageUrl?: string;
  tag?: string;
  createdAt?: unknown;
};

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "price-asc", label: "Price Low–High" },
  { value: "price-desc", label: "Price High–Low" },
  { value: "stock-desc", label: "Most Stock" },
];

function normalizeCategory(value: string | null) {
  if (!value) return "All";
  const match = SHOP_CATEGORIES.find((c) => c.toLowerCase() === value.toLowerCase());
  return match ?? "All";
}

function parsePrice(value: string | number | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function getCreatedAtValue(value: any) {
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

export default function ShopPage() {
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  const initialCategory = normalizeCategory(searchParams.get("category"));
  const initialSearch = searchParams.get("q") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1000);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const snap = await getDocs(collection(db, "products"));
        const nextProducts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
        if (!cancelled) setProducts(nextProducts);
      } catch (err) {
        console.error("Failed to load products:", err);
        if (!cancelled) setError("Could not load products right now. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory = selected === "All" || product.category === selected;
      const haystack = [product.name, product.description, product.category, product.tag]
        .filter(Boolean).join(" ").toLowerCase();
      const matchesSearch = normalizedSearch.length === 0 || haystack.includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "price-asc": return parsePrice(a.price) - parsePrice(b.price);
        case "price-desc": return parsePrice(b.price) - parsePrice(a.price);
        case "stock-desc": return (b.stock ?? 0) - (a.stock ?? 0);
        default: {
          const score = (p: Product) => {
            let total = 0;
            if (p.tag === "Popular") total += 3;
            if (p.tag === "New") total += 2;
            if ((p.stock ?? 0) > 0) total += 1;
            total += getCreatedAtValue(p.createdAt) / 1_000_000_000_000;
            return total;
          };
          return score(b) - score(a);
        }
      }
    });
  }, [products, searchTerm, selected, sortBy]);

  const hasActiveFilters = selected !== "All" || searchTerm.trim().length > 0;
  const outOfStock = (stock: number) => (stock ?? 0) <= 0;

  const resetFilters = () => {
    setSelected("All");
    setSearchTerm("");
    setSortBy("featured");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white mt-10">
        <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-12">
          <div className="mb-12 border-b border-white/20 pb-8">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-white/60" style={{ fontFamily: "Work Sans, sans-serif" }}>Emo Store</p>
            <h1 className="text-5xl uppercase tracking-wider md:text-7xl" style={{ fontFamily: '"Courier New", monospace' }}>Shop</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 md:text-lg" style={{ fontFamily: "Work Sans, sans-serif" }}>
              A clean showcase of the current collection. Search, sort, and browse the mood without clutter.
            </p>
          </div>

          <div className="mb-8 grid gap-4 lg:grid-cols-[1.25fr_0.75fr_auto]">
            <div>
              <label htmlFor="product-search" className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/50" style={{ fontFamily: "Work Sans, sans-serif" }}>Search</label>
              <input
                id="product-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, category, or tag"
                className="w-full rounded-2xl border border-white/15 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/35"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              />
            </div>
            <div>
              <label htmlFor="sort-by" className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/50" style={{ fontFamily: "Work Sans, sans-serif" }}>Sort</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-white/35"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Link href="/orders" className="w-full rounded-full border border-white/30 px-5 py-3 text-center text-sm transition hover:bg-white hover:text-black lg:w-auto" style={{ fontFamily: "Work Sans, sans-serif" }}>
                View Orders
              </Link>
            </div>
          </div>

          <div className="mb-10 flex flex-wrap gap-2">
            {SHOP_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelected(cat)}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest transition ${
                  selected === cat ? "bg-white text-black" : "border border-white/20 text-white/60 hover:border-white/40 hover:text-white"
                }`}
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {cat}
              </button>
            ))}
            {hasActiveFilters && (
              <button onClick={resetFilters} className="rounded-full border border-red-400/30 px-4 py-2 text-xs uppercase tracking-widest text-red-300 transition hover:border-red-400 hover:text-red-200" style={{ fontFamily: "Work Sans, sans-serif" }}>
                Clear
              </button>
            )}
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-white/40" style={{ fontFamily: "Work Sans, sans-serif" }}>
              {loading ? "Loading products..." : `${visibleProducts.length} item${visibleProducts.length === 1 ? "" : "s"} found`}
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-white/30" style={{ fontFamily: "Work Sans, sans-serif" }}>
              Category: {selected}
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-zinc-800 p-6 animate-pulse">
                  <div className="mb-4 h-4 w-1/3 rounded bg-zinc-700" />
                  <div className="mb-4 h-52 rounded-xl bg-zinc-700" />
                  <div className="mb-3 h-5 w-2/3 rounded bg-zinc-700" />
                  <div className="mb-2 h-3 w-full rounded bg-zinc-700" />
                  <div className="h-3 w-3/4 rounded bg-zinc-700" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-6 py-12 text-center">
              <p className="text-base text-red-200" style={{ fontFamily: "Work Sans, sans-serif" }}>{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 rounded-full border border-white/25 px-5 py-2 text-sm transition hover:bg-white hover:text-black" style={{ fontFamily: "Work Sans, sans-serif" }}>
                Try Again
              </button>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900 px-6 py-16 text-center">
              <p className="text-lg text-white/70" style={{ fontFamily: '"Courier New", monospace' }}>No products found.</p>
              <p className="mt-3 text-sm text-white/40" style={{ fontFamily: "Work Sans, sans-serif" }}>Try a different search, category, or sort option.</p>
              <button onClick={resetFilters} className="mt-6 rounded-full border border-white/25 px-5 py-2 text-sm transition hover:bg-white hover:text-black" style={{ fontFamily: "Work Sans, sans-serif" }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => {
                const oos = outOfStock(product.stock);
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group rounded-2xl border border-white/10 bg-zinc-800 p-6 transition duration-300 hover:-translate-y-1 hover:border-white/30 block"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/60" style={{ fontFamily: "Work Sans, sans-serif" }}>
                        {product.category}
                      </span>
                      {product.tag && (
                        <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.22em] ${product.tag === "New" ? "bg-white text-black" : "bg-purple-500 text-white"}`} style={{ fontFamily: "Work Sans, sans-serif" }}>
                          {product.tag}
                        </span>
                      )}
                    </div>

                    <div className="relative mb-6 h-52 overflow-hidden rounded-xl border border-white/10">
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        : <div className="h-full w-full bg-gradient-to-b from-zinc-700 to-zinc-900" />}
                      {oos && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                          <span className="rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-widest text-white" style={{ fontFamily: "Work Sans, sans-serif" }}>
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    <h2 className="text-2xl uppercase tracking-wide" style={{ fontFamily: '"Courier New", monospace' }}>
                      {product.name}
                    </h2>
                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/75" style={{ fontFamily: "Work Sans, sans-serif" }}>
                      {product.description}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-lg" style={{ fontFamily: '"Courier New", monospace' }}>
                          {product.price}
                        </span>
                        <span className={`text-xs ${oos ? "text-red-400" : "text-white/40"}`} style={{ fontFamily: "Work Sans, sans-serif" }}>
                          {oos ? "Out of stock" : `${product.stock} in stock`}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleAdd(e, product)}
                        disabled={oos}
                        className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-30 disabled:cursor-not-allowed ${
                          addedId === product.id
                            ? "border-purple-400 text-purple-400"
                            : "border-white/30 hover:bg-white hover:text-black"
                        }`}
                        style={{ fontFamily: "Work Sans, sans-serif" }}
                      >
                        {addedId === product.id ? "Added ✓" : "Add to Cart"}
                      </button>
                    </div>
                  </Link>
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