'use client';

import { useState } from "react";
import { login } from "../../app/lib/authservice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { role, uid } = await login(email, password);
      console.log("role:", role);
      document.cookie = `token=${uid}; path=/; max-age=86400`;
      document.cookie = `role=${role}; path=/; max-age=86400`;

      if (role === "admin") {
        window.location.replace("/admin");
      } else {
        window.location.replace("/");
      }
    } catch (e) {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl uppercase tracking-wider mb-10 text-center" style={{ fontFamily: '"Courier New", monospace' }}>
          Sign In
        </h1>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition placeholder:text-white/30"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition placeholder:text-white/30"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="rounded-full bg-white text-black px-6 py-3 text-sm font-medium transition hover:bg-white/80 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    </main>
  );
}