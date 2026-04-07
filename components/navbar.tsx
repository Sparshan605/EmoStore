"use client";
import { useCart } from "@/app/lib/cartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, Menu, X, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { logout } from "@/app/lib/authservice";


export default function Navbar() {

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const { count } = useCart();
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);


  const handleLogout = async () => {
    await logout();
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    setUserMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/emo", label: "Emo" },
    { href: "/goth", label: "Goth" },
    { href: "/aboutus", label: "About" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[1000] bg-black/30 backdrop-blur text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/"
              className="font-[screamFont] text-8xl font-bold bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent mt-8"
            >
              EmoStore
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-purple-400 transition">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div
                className="flex items-center"
              >
                <button className="ml-2 hover:text-purple-400 transition" onClick={() => router.push("/shop")}>
                  <Search size={20} />
                </button>
              </div>

              {/* Cart */}
              <Link href="/cart" className="hover:text-purple-400 transition relative">
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <div className="relative hidden md:block" ref={userMenuRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="hover:text-purple-400 transition flex items-center gap-1"
                    >
                      <User size={20} />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-8 w-48 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-xs text-white/40 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-3 text-sm hover:bg-white/5 transition"
                        >
                          My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href="/login" className="hover:text-purple-400 transition flex items-center gap-1 text-sm">
                    <User size={20} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}