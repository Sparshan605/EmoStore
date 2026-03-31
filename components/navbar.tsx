'use client';

import Link from 'next/link';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 w-full z-[1000] bg-black/30 backdrop-blur text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className=" font-[screamFont] text-8xl font-bold bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                        EmoStore
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8">
                        <Link href="/shop" className="hover:text-purple-400 transition">
                            Products
                        </Link>

                        <Link href="/brands" className="hover:text-purple-400 transition">
                            Goth
                        </Link>
                        <Link href="/merch" className="hover:text-purple-400 transition">
                            Merch
                        </Link>
                        <Link href="/about" className="hover:text-purple-400 transition">
                            About
                        </Link>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center space-x-4">
                        <button className="hover:text-purple-400 transition">
                            <Search size={20} />
                        </button>
                        <Link href="/cart" className="hover:text-purple-400 transition">
                            <ShoppingCart size={20} />
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden"
                            onClick={() => setIsOpen(!isOpen)}
                        >
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