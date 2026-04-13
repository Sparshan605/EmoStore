'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRequireAdmin } from "@/app/protectedRoute";
import { logout } from "@/app/lib/authservice";
import "@/app/globals.css";

const navItems = [
  { href: "/admin",         label: "Products", icon: "◈" },
  { href: "/admin/orders",  label: "Orders",   icon: "◎" },
  { href: "/admin/users",   label: "Users",    icon: "◉" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminReady = useRequireAdmin();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    window.location.href = "/login";
  };

  if (!adminReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/30 text-sm uppercase tracking-widest" style={{ fontFamily: "Work Sans, sans-serif" }}>
          Authenticating...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-white/10 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-6 pt-8 pb-6 border-b border-white/10">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/25 mb-1" style={{ fontFamily: "Work Sans, sans-serif" }}>
            EmoStore
          </p>
          <h1 className="text-2xl uppercase tracking-wider" style={{ fontFamily: '"Courier New", monospace' }}>
            Admin
          </h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-white text-black font-medium"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-6 border-t border-white/10 pt-4 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition text-left"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            <span className="text-base leading-none">⊗</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 px-8 py-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}