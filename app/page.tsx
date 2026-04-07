"use client";

import { Hero } from "../components/HeroUI";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { HeroBody } from "@/components/HeroBody";
import { useRequireAuth } from "./protectedRoute";

export default function Home() {

  const authReady = useRequireAuth();

  if (!authReady) {
    return <p className="text-white p-6">Loading...</p>;
  }

  return (
    <>
      <Navbar />
      <Hero />
      <HeroBody />
      <Footer />
    </>
  );
}