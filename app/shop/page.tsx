'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

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

const categories = ["All", "Apparel", "Outerwear", "Accessory", "Bag", "Shoes", "Jewelry", "Merch"];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "All";

  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState(initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = selected === "All"
    ? products
    : products.filter((p) => p.category === selected);

  const outOfStock = (stock: number) => (stock ?? 0) === 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white mt-10">
        <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-12">

          {/* Header */}
          <div className="mb-12 border-b border-white/20 pb-8">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-white/60" style={{ fontFamily: "Work Sans, sans-serif" }}>
              Emo Store
            </p>
            <h1 className="text-5xl uppercase tracking-wider md:text-7xl" style={{ fontFamily: '"Courier New", monospace' }}>
              Shop
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 md:text-lg" style={{ fontFamily: "Work Sans, sans-serif" }}>
              A clean showcase of the current collection. No heavy filters, no clutter, just the mood, the pieces, and the aesthetic.
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-10 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelected(cat)}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest transition
                  ${selected === cat
                    ? "bg-white text-black"
                    : "border border-white/20 text-white/60 hover:border-white/40 hover:text-white"}`}
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Count */}
          <div className="mb-8 flex items-center justify-between">
            <p className="text-sm text-white/40" style={{ fontFamily: "Work Sans, sans-serif" }}>
              {loading ? "Loading..." : `${filtered.length} items`}
            </p>
            <Link
              href="/orders"
              className="rounded-full border border-white/30 px-5 py-2 text-sm transition hover:bg-white hover:text-black"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              View Orders
            </Link>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-zinc-800 p-6 animate-pulse">
                  <div className="h-4 bg-zinc-700 rounded mb-4 w-1/3" />
                  <div className="h-52 bg-zinc-700 rounded-xl mb-4" />
                  <div className="h-4 bg-zinc-700 rounded mb-2 w-2/3" />
                  <div className="h-3 bg-zinc-700 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-32 text-center text-white/30 text-sm" style={{ fontFamily: "Work Sans, sans-serif" }}>
              No products in this category yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => {
                const oos = outOfStock(product.stock);
                return (
                  <article
                    key={product.id}
                    className="group rounded-2xl border border-white/10 bg-zinc-800 p-6 transition duration-300 hover:-translate-y-1 hover:border-white/30"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <span
                        className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/60"
                        style={{ fontFamily: "Work Sans, sans-serif" }}
                      >
                        {product.category}
                      </span>
                      {product.tag && (
                        <span
                          className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.22em] ${product.tag === "New" ? "bg-white text-black" : "bg-purple-500 text-white"}`}
                          style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                          {product.tag}
                        </span>
                      )}
                    </div>

                    {/* Image */}
                    <div className="relative mb-6 h-52 rounded-xl border border-white/10 overflow-hidden">
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-b from-zinc-700 to-zinc-900" />}
                      {oos && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-white text-xs uppercase tracking-widest border border-white/30 px-4 py-2 rounded-full" style={{ fontFamily: "Work Sans, sans-serif" }}>
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
                        disabled={oos}
                        className="rounded-full border border-white/30 px-4 py-2 text-sm transition hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ fontFamily: "Work Sans, sans-serif" }}
                      >
                        Add to Cart
                      </button>
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