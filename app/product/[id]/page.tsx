'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useCart } from "../../lib/cartContext";

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

export default function ProductPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params?.id) return;
      try {
        const snap = await getDoc(doc(db, "products", params.id as string));
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() } as Product);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params?.id]);

  const handleAdd = () => {
    if (!product || (product.stock ?? 0) === 0) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const outOfStock = (product?.stock ?? 0) === 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white mt-10">
        <section className="mx-auto max-w-5xl px-6 py-12 md:px-10 lg:px-12">

          {/* Back link */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-white transition mb-10"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            ← Back to Shop
          </Link>

          {loading ? (
            <div className="grid gap-10 md:grid-cols-2 animate-pulse">
              <div className="rounded-2xl bg-zinc-800 aspect-square" />
              <div className="space-y-4 pt-4">
                <div className="h-4 w-24 rounded bg-zinc-700" />
                <div className="h-10 w-3/4 rounded bg-zinc-700" />
                <div className="h-4 w-full rounded bg-zinc-700" />
                <div className="h-4 w-5/6 rounded bg-zinc-700" />
                <div className="h-4 w-2/3 rounded bg-zinc-700" />
                <div className="h-12 w-40 rounded-full bg-zinc-700 mt-8" />
              </div>
            </div>
          ) : !product ? (
            <div className="py-24 text-center">
              <p className="text-2xl text-white/40 mb-6" style={{ fontFamily: '"Courier New", monospace' }}>Product not found.</p>
              <Link href="/shop" className="rounded-full border border-white/30 px-6 py-3 text-sm hover:bg-white hover:text-black transition" style={{ fontFamily: "Work Sans, sans-serif" }}>
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 md:grid-cols-2">
              {/* Image */}
              <div className="relative rounded-2xl border border-white/10 overflow-hidden aspect-square bg-zinc-900">
                {product.imageUrl
                  ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-b from-zinc-700 to-zinc-900" />}
                {outOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <span className="rounded-full border border-white/30 px-6 py-3 text-sm uppercase tracking-widest text-white" style={{ fontFamily: "Work Sans, sans-serif" }}>
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/60" style={{ fontFamily: "Work Sans, sans-serif" }}>
                    {product.category}
                  </span>
                  {product.tag && (
                    <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.22em] ${product.tag === "New" ? "bg-white text-black" : "bg-purple-500 text-white"}`} style={{ fontFamily: "Work Sans, sans-serif" }}>
                      {product.tag}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl uppercase tracking-wide mb-4 md:text-5xl" style={{ fontFamily: '"Courier New", monospace' }}>
                  {product.name}
                </h1>

                <p className="text-base leading-7 text-white/70 mb-8" style={{ fontFamily: "Work Sans, sans-serif" }}>
                  {product.description}
                </p>

                <div className="flex items-end gap-4 mb-8">
                  <span className="text-3xl" style={{ fontFamily: '"Courier New", monospace' }}>
                    {product.price}
                  </span>
                  <span className={`text-sm pb-1 ${outOfStock ? "text-red-400" : "text-white/40"}`} style={{ fontFamily: "Work Sans, sans-serif" }}>
                    {outOfStock ? "Out of stock" : `${product.stock} in stock`}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleAdd}
                    disabled={outOfStock}
                    className={`rounded-full px-8 py-3 text-sm font-medium transition disabled:opacity-30 disabled:cursor-not-allowed ${
                      added
                        ? "bg-purple-500 text-white border border-purple-400"
                        : "bg-white text-black hover:bg-white/80"
                    }`}
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    {added ? "Added to Cart ✓" : "Add to Cart"}
                  </button>
                  <Link
                    href="/cart"
                    className="rounded-full border border-white/30 px-6 py-3 text-sm transition hover:bg-white/10"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}