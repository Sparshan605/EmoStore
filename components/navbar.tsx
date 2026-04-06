"use client";
import { useCart } from "@/app/lib/cartContext";
import Link from "next/link";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { count } = useCart();
  const expand = () => {
    setSearchExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000] bg-black/30 backdrop-blur text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="font-[screamFont] text-8xl font-bold bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent mt-8"
          >
            EmoStore
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="/" className="hover:text-purple-400 transition">
              Home
            </Link>
            <Link href="/shop" className="hover:text-purple-400 transition">
              Products
            </Link>
            <Link href="/brands" className="hover:text-purple-400 transition">
              Goth
            </Link>
            <Link href="/aboutus" className="hover:text-purple-400 transition">
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div
              className="flex items-center"
              onMouseLeave={() => setSearchExpanded(false)}
            >
              <div
                className={`flex items-center transition-all duration-300 ${
                  searchExpanded
                    ? "border-2 border-purple-400/40 rounded-full px-3 py-1"
                    : "border-transparent"
                }`}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  className={`transition-all duration-300 bg-transparent border-b border-purple-400 outline-none text-sm placeholder:text-white/40
                      ${
                      searchExpanded
                      ? "w-40 opacity-100 mr-2"
                    : "w-0 opacity-0 pointer-events-none"
                  }`}
                />
              </div>
              <button
                className="ml-2 hover:text-purple-400 transition"
                onClick={expand}
              >
                <Search size={20} />
              </button>
            </div>

            <Link href="/cart" className="hover:text-purple-400 transition relative">
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
