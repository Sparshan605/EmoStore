'use client';

import "../app/globals.css";
import localFont from "next/font/local";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { db } from "../app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const screamFont = localFont({
  src: "../public/fonts/EyesWideSuicide-vVzM.ttf",
  variable: "--font-scream",
});

const categories = [
  { label: "Emo", catimg: "https://i.pinimg.com/736x/54/61/75/5461756d8147358e364835bd2003349f.jpg" },
  { label: "Goth", catimg: "https://i.pinimg.com/736x/52/5a/27/525a270e5424a0524a563fd566555c11.jpg" },
];

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

function ProductCard({ product, rank }: { product: Product; rank?: number }) {
  const outOfStock = (product.stock ?? 0) === 0;
  return (
    <article className="group flex-shrink-0 w-72 rounded-2xl border border-white/10 bg-zinc-800 p-6 transition duration-300 hover:-translate-y-1 hover:border-white/30">
      <div className="mb-5 flex items-start justify-between gap-4">
        <span
          className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/60"
          style={{ fontFamily: "Work Sans, sans-serif" }}
        >
          {product.category}
        </span>
        {rank !== undefined ? (
          <span className="text-2xl font-bold text-white/10" style={{ fontFamily: '"Courier New", monospace' }}>
            #{rank + 1}
          </span>
        ) : (
          <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.22em] text-black" style={{ fontFamily: "Work Sans, sans-serif" }}>
            New
          </span>
        )}
      </div>

      {/* Image with out of stock overlay */}
      <div className="relative mb-6 h-52 rounded-xl border border-white/10 overflow-hidden">
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-b from-zinc-700 to-zinc-900" />}

        {outOfStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <span
              className="text-white text-sm uppercase tracking-widest border border-white/30 px-4 py-2 rounded-full"
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <h3 className="text-2xl uppercase tracking-wide" style={{ fontFamily: '"Courier New", monospace' }}>
        {product.name}
      </h3>
      <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/75" style={{ fontFamily: "Work Sans, sans-serif" }}>
        {product.description}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-lg" style={{ fontFamily: '"Courier New", monospace' }}>
            {product.price}
          </span>
          <span
            className={`text-xs ${outOfStock ? "text-red-400" : "text-white/40"}`}
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            {outOfStock ? "Out of stock" : `${product.stock} in stock`}
          </span>
        </div>
        <button
          disabled={outOfStock}
          className="rounded-full border border-white/30 px-4 py-2 text-sm transition hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ fontFamily: "Work Sans, sans-serif" }}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {/* Left Button */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition -translate-x-2"
      >
        ‹
      </button>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 px-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      {/* Right Button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition translate-x-2"
      >
        ›
      </button>
    </div>
  );
}

export function HeroBody() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const newArrivals = products.filter((p) => p.tag === "New");
  const mostPopular = products.filter((p) => p.tag === "Popular");

  return (
    <div className={`${screamFont.variable} min-h-screen bg-black text-white`}>

      {/* SHOP BY CATEGORY */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="mb-10 border-b border-white/20 pb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.35em] text-white/60" style={{ fontFamily: "Work Sans, sans-serif" }}>
            Browse
          </p>
          <h2 className="text-4xl uppercase tracking-wider md:text-6xl" style={{ fontFamily: '"Courier New", monospace' }}>
            Shop by Category
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 h-120">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={`/shop?category=${cat.label.toLowerCase()}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 transition duration-300 hover:-translate-y-1 hover:border-white/20"
            >
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${cat.catimg})` }} />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition" />
              <div className="flex items-end justify-start relative z-10 p-6 h-full">
                <h3 className="font-[ScreamFont] bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent md:text-9xl uppercase tracking-wide">
                  {cat.label}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {!loading && newArrivals.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-12 mb-10">
            <div className="border-b border-white/20 pb-6">
              <p className="mb-2 text-sm uppercase tracking-[0.35em] text-white/60" style={{ fontFamily: "Work Sans, sans-serif" }}>
                Just Dropped
              </p>
              <h2 className="text-4xl uppercase tracking-wider md:text-6xl" style={{ fontFamily: '"Courier New", monospace' }}>
                New Arrivals
              </h2>
            </div>
          </div>
          <div className="px-6 md:px-10 lg:px-12">
            <HorizontalScroll>
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </HorizontalScroll>
          </div>
        </section>
      )}

      {/* MOST POPULAR */}
      {!loading && mostPopular.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-12 mb-10">
            <div className="border-b border-white/20 pb-6">
              <p className="mb-2 text-sm uppercase tracking-[0.35em] text-white/60" style={{ fontFamily: "Work Sans, sans-serif" }}>
                Fan Favourites
              </p>
              <h2 className="text-4xl uppercase tracking-wider md:text-6xl" style={{ fontFamily: '"Courier New", monospace' }}>
                Most Popular
              </h2>
            </div>
          </div>
          <div className="px-6 md:px-10 lg:px-12">
            <HorizontalScroll>
              {mostPopular.map((product, i) => (
                <ProductCard key={product.id} product={product} rank={i} />
              ))}
            </HorizontalScroll>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="rounded-2xl border border-white/10 bg-zinc-800 p-12 text-center md:p-20">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-white/60" style={{ fontFamily: "Work Sans, sans-serif" }}>
            The Full Collection
          </p>
          <h2 className="text-4xl uppercase tracking-wider md:text-6xl" style={{ fontFamily: '"Courier New", monospace' }}>
            See Everything
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/70" style={{ fontFamily: "Work Sans, sans-serif" }}>
            All the pieces, no filters. Just the mood, the aesthetic, and the full drop.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition hover:bg-white/80"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Shop All
          </Link>
        </div>
      </section>
    </div>
  );
}