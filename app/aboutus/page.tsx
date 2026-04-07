import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function About() {
  return (
    <>
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12 mt-10">
        <div className="mb-10 border-b border-white/20 pb-6">
          <p
            className="mb-2 text-sm uppercase tracking-[0.35em] text-white/60"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Our Story
          </p>
          <h2
            className="text-4xl uppercase tracking-wider md:text-6xl"
            style={{ fontFamily: '"Courier New", monospace' }}
          >
            About Us
          </h2>
        </div>
        <p
          className="max-w-2xl text-lg leading-8 text-white/80"
          style={{ fontFamily: "Work Sans, sans-serif" }}
        >
          Founded in 2026, EmoStore is a passion project born from a love of alternative fashion and culture.
          We curate a collection of clothing, accessories, and merch that embodies the spirit of emo, goth, and punk aesthetics.
          Our mission is to provide a platform for self-expression through fashion, offering unique pieces that resonate
          with the mood and attitude of our community. At EmoStore, we believe in embracing individuality and celebrating
          the darker side of style.
        </p>
      </section>
      <Footer />
    </>
  );
}