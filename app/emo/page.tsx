'use client';

import localFont from "next/font/local";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useCart } from "@/app/lib/cartContext";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const screamFont = localFont({
  src: "../../public/fonts/EyesWideSuicide-vVzM.ttf",
  variable: "--font-scream",
});

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

function ProductCard({ product, rank }: { product: Product; rank?: number }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = (product.stock ?? 0) === 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, category: product.category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex-shrink-0 w-72 rounded-2xl border border-white/10 bg-zinc-900 p-6 transition duration-300 hover:-translate-y-1 hover:border-white/25 block"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/50" style={{ fontFamily: "Work Sans, sans-serif" }}>
          {product.category}
        </span>
        {rank !== undefined ? (
          <span className="text-2xl font-bold text-white/10" style={{ fontFamily: '"Courier New", monospace' }}>#{rank + 1}</span>
        ) : product.tag ? (
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs uppercase tracking-[0.22em] text-black" style={{ fontFamily: "Work Sans, sans-serif" }}>
            {product.tag}
          </span>
        ) : null}
      </div>

      <div className="relative mb-6 h-52 rounded-xl border border-white/10 overflow-hidden">
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition duration-500" />
          : <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-zinc-950" />}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-sm uppercase tracking-widest border border-white/30 px-4 py-2 rounded-full" style={{ fontFamily: "Work Sans, sans-serif" }}>Out of Stock</span>
          </div>
        )}
      </div>

      <h3 className="text-2xl uppercase tracking-wide" style={{ fontFamily: '"Courier New", monospace' }}>{product.name}</h3>
      <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/60" style={{ fontFamily: "Work Sans, sans-serif" }}>{product.description}</p>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-lg" style={{ fontFamily: '"Courier New", monospace' }}>{product.price}</span>
          <span className={`text-xs ${outOfStock ? "text-red-400" : "text-white/35"}`} style={{ fontFamily: "Work Sans, sans-serif" }}>
            {outOfStock ? "Out of stock" : `${product.stock} in stock`}
          </span>
        </div>
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-30 disabled:cursor-not-allowed ${added ? "border-purple-400 text-purple-400" : "border-white/25 hover:bg-white hover:text-black"}`}
          style={{ fontFamily: "Work Sans, sans-serif" }}
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };
  return (
    <div className="relative">
      <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition -translate-x-2">‹</button>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 px-6" style={{ scrollbarWidth: "none" }}>{children}</div>
      <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition translate-x-2">›</button>
    </div>
  );
}

export default function EmoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [customTags, setCustomTags] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("emo_custom_tags") || "[]");
      setCustomTags(stored);
    } catch {}

    const fetchProducts = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "products"), where("style", "==", "Emo"))
        );
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const allTags = ["New", "Popular", ...customTags];
  const byTag = (tag: string) => products.filter((p) => p.tag === tag);
  const untagged = products.filter((p) => !p.tag || p.tag === "");
  const sectionsWithProducts = allTags.filter((t) => byTag(t).length > 0);

  const tagMeta: Record<string, { eyebrow: string; heading: string }> = {
    New:     { eyebrow: "Just Dropped",   heading: "New Arrivals" },
    Popular: { eyebrow: "Fan Favourites", heading: "Most Popular" },
  };

  return (
    <div className={`${screamFont.variable} min-h-screen bg-black text-white`}>
      <Navbar />

      {/* Hero */}
      <div className="relative h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-top bg-[url('https://i.pinimg.com/736x/54/61/75/5461756d8147358e364835bd2003349f.jpg')]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-12 pb-16 w-full">
          <p className="text-sm uppercase tracking-[0.35em] text-white/50 mb-3" style={{ fontFamily: "Work Sans, sans-serif" }}>
            The Emo Collection
          </p>
          <h1 className="font-[ScreamFont] text-[18vw] md:text-[12vw] uppercase leading-none bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            Emo
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/60 leading-7" style={{ fontFamily: "Work Sans, sans-serif" }}>
            Feelings worn on your sleeve. Raw emotion, honest aesthetic. This is the sound of your wardrobe.
          </p>
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 rounded-2xl border border-white/10 bg-zinc-900 p-6 animate-pulse">
                <div className="h-4 w-1/3 rounded bg-zinc-800 mb-4" />
                <div className="h-52 rounded-xl bg-zinc-800 mb-4" />
                <div className="h-5 w-2/3 rounded bg-zinc-800 mb-2" />
                <div className="h-3 w-full rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tagged sections */}
      {!loading && sectionsWithProducts.map((tag) => {
        const items = byTag(tag);
        const meta = tagMeta[tag] ?? { eyebrow: tag, heading: tag };
        return (
          <section key={tag} className="py-20">
            <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-12 mb-10">
              <div className="border-b border-white/15 pb-6">
                <p className="mb-2 text-sm uppercase tracking-[0.35em] text-white/50" style={{ fontFamily: "Work Sans, sans-serif" }}>{meta.eyebrow}</p>
                <h2 className="text-4xl uppercase tracking-wider md:text-6xl" style={{ fontFamily: '"Courier New", monospace' }}>{meta.heading}</h2>
              </div>
            </div>
            <div className="px-6 md:px-10 lg:px-12">
              <HorizontalScroll>
                {items.map((p, i) => (
                  <ProductCard key={p.id} product={p} rank={tag === "Popular" ? i : undefined} />
                ))}
              </HorizontalScroll>
            </div>
          </section>
        );
      })}

      {/* Untagged products */}
      {!loading && untagged.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-12 mb-10">
            <div className="border-b border-white/15 pb-6">
              <p className="mb-2 text-sm uppercase tracking-[0.35em] text-white/50" style={{ fontFamily: "Work Sans, sans-serif" }}>The Collection</p>
              <h2 className="text-4xl uppercase tracking-wider md:text-6xl" style={{ fontFamily: '"Courier New", monospace' }}>All Emo</h2>
            </div>
          </div>
          <div className="px-6 md:px-10 lg:px-12">
            <HorizontalScroll>
              {untagged.map((p) => <ProductCard key={p.id} product={p} />)}
            </HorizontalScroll>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <section className="mx-auto max-w-7xl px-6 py-32 text-center">
          <p className="text-4xl text-white/20 mb-4" style={{ fontFamily: '"Courier New", monospace' }}>No emo products yet.</p>
          <p className="text-sm text-white/30 mb-8" style={{ fontFamily: "Work Sans, sans-serif" }}>
            Set a product's style to "Emo" in the admin panel to have it appear here.
          </p>
          <Link href="/goth" className="rounded-full border border-white/25 px-6 py-3 text-sm hover:bg-white hover:text-black transition" style={{ fontFamily: "Work Sans, sans-serif" }}>
            Browse Goth Instead
          </Link>
        </section>
      )}

      {/* CTA */}
      {!loading && products.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-12 text-center md:p-20">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-white/50" style={{ fontFamily: "Work Sans, sans-serif" }}>Not Just Emo</p>
            <h2 className="text-4xl uppercase tracking-wider md:text-6xl" style={{ fontFamily: '"Courier New", monospace' }}>Full Shop</h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/60" style={{ fontFamily: "Work Sans, sans-serif" }}>
              The full collection awaits — emo, goth, punk, and everything in between.
            </p>
            <Link href="/goth" className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition hover:bg-white/80" style={{ fontFamily: "Work Sans, sans-serif" }}>
              Browse Goth
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}