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
  const [isOpen, setIsOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const expand = () => {
    setSearchExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchExpanded(false);
      setSearchValue("");
    }
    if (e.key === "Escape") {
      setSearchExpanded(false);
      setSearchValue("");
    }
  };

  const handleLogout = async () => {
    await logout();
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    setUserMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Products" },
    { href: "/shop?category=goth", label: "Goth" },
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
                onMouseLeave={() => {
                  if (!searchValue) setSearchExpanded(false);
                }}
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
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleSearch}
                    placeholder="Search... (Enter)"
                    className={`transition-all duration-300 bg-transparent border-b border-purple-400 outline-none text-sm placeholder:text-white/40
                      ${searchExpanded ? "w-44 opacity-100 mr-2" : "w-0 opacity-0 pointer-events-none"}`}
                  />
                </div>
                <button className="ml-2 hover:text-purple-400 transition" onClick={expand}>
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

              {/* Mobile hamburger */}
              <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isOpen && (
          <div className="md:hidden bg-black/95 border-t border-white/10 px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 text-sm rounded-xl hover:bg-white/5 hover:text-purple-400 transition"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 mt-3 pt-3">
              {user ? (
                <>
                  <p className="px-3 py-2 text-xs text-white/40 truncate">{user.email}</p>
                  <Link
                    href="/orders"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-3 text-sm rounded-xl hover:bg-white/5 transition"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-3 text-sm text-red-400 rounded-xl hover:bg-white/5 transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 text-sm rounded-xl hover:bg-white/5 hover:text-purple-400 transition"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}