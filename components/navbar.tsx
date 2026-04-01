"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { useState, useRef } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const expand = () => {
    setSearchExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000] bg-black/30 backdrop-blur text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="font-[screamFont] text-8xl font-bold bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent"
          >
            EmoStore
          </Link>

          {/* Desktop Menu */}
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

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
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
                className=" ml-2 hover:text-purple-400 transition"
                onClick={expand}
              >
                <Search size={20} />
              </button>
            </div>

            <Link href="/payment" className="hover:text-purple-400 transition">
              <ShoppingCart size={20} />
            </Link>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/products" className="block py-2 hover:text-purple-400">
              Products
            </Link>
            <Link href="/bands" className="block py-2 hover:text-purple-400">
              Bands
            </Link>
            <Link href="/merch" className="block py-2 hover:text-purple-400">
              Merch
            </Link>
            <Link href="/about" className="block py-2 hover:text-purple-400">
              About
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
