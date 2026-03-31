
import "../app/globals.css";
import localFont from "next/font/local";
import Link from "next/link";

const screamFont = localFont({
  src: "../public/fonts/EyesWideSuicide-vVzM.ttf",
  variable: "--font-scream",
});

const newArrivals = [
  {
    id: 7,
    name: "Grief Wash Jacket",
    price: "$110",
    category: "Outerwear",
    description: "Distressed denim with a heavy soul. Limited run.",
    tag: "New",
  },
  {
    id: 8,
    name: "Hollow Crest Tee",
    price: "$48",
    category: "Apparel",
    description: "Faded black with a hand-drawn chest print.",
    tag: "New",
  },
  {
    id: 9,
    name: "Void Stitch Cap",
    price: "$35",
    category: "Accessory",
    description: "Low profile, dark brim, minimal embroidery.",
    tag: "New",
  },
];

const mostPopular = [
  {
    id: 2,
    name: "Midnight Noise Hoodie",
    price: "$80",
    category: "Outerwear",
    description: "Heavyweight oversized hoodie for cold nights and louder moods.",
    sales: "412 sold",
  },
  {
    id: 1,
    name: "Velvet Ruin Tee",
    price: "$45",
    category: "Apparel",
    description: "A washed black graphic tee built for the sad and stylish.",
    sales: "389 sold",
  },
  {
    id: 6,
    name: "Ashes Tote Bag",
    price: "$30",
    category: "Bag",
    description: "A simple statement carry-all in black and white.",
    sales: "301 sold",
  },
];

const categories = [
  {
    label: "Emo",
    catimg: "https://i.pinimg.com/736x/54/61/75/5461756d8147358e364835bd2003349f.jpg",
  },
  {
    label: "Goth",
    catimg: "https://i.pinimg.com/736x/52/5a/27/525a270e5424a0524a563fd566555c11.jpg",
  },
];
export function HeroBody() {
  return (
    <div className={`${screamFont.variable} min-h-screen bg-black text-white`}>
      {/* ── SHOP BY CATEGORY ── */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="mb-10 border-b border-white/20 pb-6">
          <p
            className="mb-2 text-sm uppercase tracking-[0.35em] text-white/60"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Browse
          </p>
          <h2
            className="text-4xl uppercase tracking-wider md:text-6xl"
            style={{ fontFamily: '"Courier New", monospace' }}
          >
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
               <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${cat.catimg})` }}
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition" />

                {/* Text */}
                <div className="flex items-end justify-start relative z-10 p-6 h-full">
                    <h3 className=" font-[ScreamFont] bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent md:text-9xl uppercase tracking-wide ">
                    {cat.label}
                    </h3>
                </div>

            </Link>
          ))}
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="mb-10 border-b border-white/20 pb-6">
          <p
            className="mb-2 text-sm uppercase tracking-[0.35em] text-white/60"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Just Dropped
          </p>
          <h2
            className="text-4xl uppercase tracking-wider md:text-6xl"
            style={{ fontFamily: '"Courier New", monospace' }}
          >
            New Arrivals
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {newArrivals.map((product) => (
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
                  className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.22em] text-black"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  {product.tag}
                </span>
              </div>

              <div className="mb-6 h-52 rounded-xl border border-white/10 bg-gradient-to-b from-zinc-700 to-zinc-900" />

              <h3
                className="text-2xl uppercase tracking-wide"
                style={{ fontFamily: '"Courier New", monospace' }}
              >
                {product.name}
              </h3>
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

      {/* ── MOST POPULAR ── */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="mb-10 border-b border-white/20 pb-6">
          <p
            className="mb-2 text-sm uppercase tracking-[0.35em] text-white/60"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Fan Favourites
          </p>
          <h2
            className="text-4xl uppercase tracking-wider md:text-6xl"
            style={{ fontFamily: '"Courier New", monospace' }}
          >
            Most Popular
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {mostPopular.map((product, i) => (
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
                  className="text-2xl font-bold text-white/10"
                  style={{ fontFamily: '"Courier New", monospace' }}
                >
                  #{i + 1}
                </span>
              </div>

              <div className="mb-6 h-52 rounded-xl border border-white/10 bg-gradient-to-b from-zinc-700 to-zinc-900" />

              <h3
                className="text-2xl uppercase tracking-wide"
                style={{ fontFamily: '"Courier New", monospace' }}
              >
                {product.name}
              </h3>
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
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="text-xs text-white/40"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    {product.sales}
                  </span>
                  <button
                    className="rounded-full border border-white/30 px-4 py-2 text-sm transition hover:bg-white hover:text-black"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="rounded-2xl border border-white/10 bg-zinc-800 p-12 text-center md:p-20">
          <p
            className="mb-3 text-sm uppercase tracking-[0.35em] text-white/60"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            The Full Collection
          </p>
          <h2
            className="text-4xl uppercase tracking-wider md:text-6xl"
            style={{ fontFamily: '"Courier New", monospace' }}
          >
            See Everything
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/70"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
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