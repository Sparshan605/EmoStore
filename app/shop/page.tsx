import Link from "next/link";

const products = [
  {
    id: 1,
    name: "Velvet Ruin Tee",
    price: "$45",
    category: "Apparel",
    description: "A washed black graphic tee built for the sad and stylish.",
  },
  {
    id: 2,
    name: "Midnight Noise Hoodie",
    price: "$80",
    category: "Outerwear",
    description: "Heavyweight oversized hoodie for cold nights and louder moods.",
  },
  {
    id: 3,
    name: "Broken Signal Chain",
    price: "$28",
    category: "Accessory",
    description: "Minimal metallic piece with a darker edge.",
  },
  {
    id: 4,
    name: "Silent Crowd Long Sleeve",
    price: "$55",
    category: "Apparel",
    description: "Clean monochrome fit with subtle emo-store energy.",
  },
  {
    id: 5,
    name: "Static Heart Ring",
    price: "$22",
    category: "Accessory",
    description: "Small detail, strong vibe. Designed for the full look.",
  },
  {
    id: 6,
    name: "Ashes Tote Bag",
    price: "$30",
    category: "Bag",
    description: "A simple statement carry-all in black and white.",
  },
];

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-12">
        <div className="mb-12 border-b border-white/20 pb-8">
          <p
            className="mb-3 text-sm uppercase tracking-[0.35em] text-white/60"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Emo Store
          </p>

          <h1
            className="text-5xl uppercase tracking-wider md:text-7xl"
            style={{ fontFamily: '"Quiet Scream", "Courier New", monospace' }}
          >
            Shop
          </h1>

          <p
            className="mt-5 max-w-2xl text-base leading-7 text-white/80 md:text-lg"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            A clean showcase of the current collection. No heavy filters, no clutter,
            just the mood, the pieces, and the aesthetic.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <p
            className="text-sm text-white/60"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            {products.length} items available
          </p>

          <Link
            href="/orders"
            className="rounded-full border border-white/30 px-5 py-2 text-sm transition hover:bg-white hover:text-black"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            View Orders
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
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

                <span
                  className="text-sm text-white/70"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  #{product.id.toString().padStart(2, "0")}
                </span>
              </div>

              <div className="mb-6 h-52 rounded-xl border border-white/10 bg-gradient-to-b from-zinc-700 to-zinc-900" />

              <h2
                className="text-2xl uppercase tracking-wide"
                style={{ fontFamily: '"Courier New", monospace' }}
              >
                {product.name}
              </h2>

              <p
                className="mt-3 min-h-[72px] text-sm leading-6 text-white/75"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                {product.description}
              </p>

              <div className="mt-6 flex items-center justify-between">
                <span
                  className="text-lg"
                  style={{ fontFamily: '"Courier New", monospace' }}
                >
                  {product.price}
                </span>

                <button
                  className="rounded-full border border-white/30 px-4 py-2 text-sm transition hover:bg-white hover:text-black"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}