import { Hero } from "../components/HeroUI";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { HeroBody } from "@/components/HeroBody";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HeroBody />
      <Footer />
    </>
  );
}