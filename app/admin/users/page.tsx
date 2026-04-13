'use client';

import React, { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppUser = {
  id: string;
  email?: string;
  role?: string;
  createdAt?: any;
  displayName?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(value: any) {
  if (!value) return "—";
  let d: Date | null = null;
  if (typeof value?.toDate === "function") d = value.toDate();
  else if (value instanceof Date) d = value;
  else if (typeof value === "number") d = new Date(value);
  else if (typeof value === "object" && typeof value.seconds === "number") d = new Date(value.seconds * 1000);
  if (!d) return "—";
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("user");
  const [savingRole, setSavingRole] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppUser));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const saveRole = async (uid: string) => {
    setSavingRole(true);
    try {
      await updateDoc(doc(db, "users", uid), { role: editRole });
      setUsers((prev) => prev.map((u) => u.id === uid ? { ...u, role: editRole } : u));
      setEditingUserId(null);
    } catch (e) { console.error(e); }
    setSavingRole(false);
  };

  const deleteUser = async (uid: string, email?: string) => {
    if (!confirm(`Delete ${email ?? uid}? This removes their Firestore doc only — their Firebase Auth account remains.`)) return;
    try {
      await deleteDoc(doc(db, "users", uid));
      setUsers((prev) => prev.filter((u) => u.id !== uid));
      if (editingUserId === uid) setEditingUserId(null);
    } catch (e) { console.error(e); }
  };

  const roleBadge = (role?: string) =>
    role === "admin"
      ? "bg-purple-500 text-white"
      : "bg-zinc-800 text-white/40 border border-white/10";

  const filtered = users.filter((u) => {
    const matchRole = filterRole === "All" || (u.role ?? "user") === filterRole;
    const q = search.toLowerCase();
    const matchSearch = !q || (u.email ?? "").toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || (u.displayName ?? "").toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  return (
    <div>
      {/* Heading */}
      <div className="mb-10 pb-6 border-b border-white/10">
        <p className="text-xs uppercase tracking-[0.35em] text-white/30 mb-1" style={{ fontFamily: "Work Sans, sans-serif" }}>
          Users
        </p>
        <h2 className="text-4xl uppercase tracking-wider" style={{ fontFamily: '"Courier New", monospace' }}>
          Users
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Users", value: users.length },
          { label: "Admins",      value: users.filter((u) => u.role === "admin").length },
          { label: "Customers",   value: users.filter((u) => !u.role || u.role === "user").length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-2" style={{ fontFamily: "Work Sans, sans-serif" }}>{stat.label}</p>
            <p className="text-3xl" style={{ fontFamily: '"Courier New", monospace' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by email or UID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 bg-zinc-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-400 transition placeholder:text-white/25"
          style={{ fontFamily: "Work Sans, sans-serif" }}
        />
        <div className="flex gap-2">
          {["All", "user", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest transition ${
                filterRole === r ? "bg-white text-black" : "border border-white/20 text-white/50 hover:text-white"
              }`}
              style={{ fontFamily: "Work Sans, sans-serif" }}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/25 ml-auto" style={{ fontFamily: "Work Sans, sans-serif" }}>
          {filtered.length} of {users.length}
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl border border-white/10 bg-zinc-900 h-16 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-white/10 bg-zinc-950">
          <p className="text-white/25 text-sm" style={{ fontFamily: "Work Sans, sans-serif" }}>
            {users.length === 0 ? "No users found in Firestore /users collection." : "No users match your search."}
          </p>
          {users.length === 0 && (
            <p className="text-white/15 text-xs mt-2 max-w-xs mx-auto" style={{ fontFamily: "Work Sans, sans-serif" }}>
              Users are created at /users/&#123;uid&#125; on registration. Make sure your sign-up flow writes a doc there.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "520px" }}>
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900">
                {["User", "UID", "Role", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-white/40 font-normal uppercase tracking-widest text-xs" style={{ fontFamily: "Work Sans, sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <React.Fragment key={user.id}>
                  <tr className={`border-b border-white/5 hover:bg-zinc-900/60 transition ${i % 2 === 0 ? "bg-zinc-950" : "bg-black"}`}>
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-white/40" style={{ fontFamily: '"Courier New", monospace' }}>
                            {(user.email ?? user.displayName ?? "?")[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm truncate" style={{ fontFamily: "Work Sans, sans-serif" }}>
                            {user.email ?? "No email"}
                          </p>
                          {user.displayName && (
                            <p className="text-xs text-white/30 truncate" style={{ fontFamily: "Work Sans, sans-serif" }}>{user.displayName}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* UID */}
                    <td className="px-5 py-4">
                      <code className="text-xs text-white/25 font-mono bg-white/5 px-2 py-1 rounded-lg">
                        {user.id.slice(0, 8)}…
                      </code>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest ${roleBadge(user.role)}`} style={{ fontFamily: "Work Sans, sans-serif" }}>
                        {user.role ?? "user"}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-xs text-white/35" style={{ fontFamily: "Work Sans, sans-serif" }}>
                      {formatTimestamp(user.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingUserId(editingUserId === user.id ? null : user.id);
                            setEditRole(user.role ?? "user");
                          }}
                          className={`text-xs border rounded-full px-3 py-1.5 transition ${
                            editingUserId === user.id
                              ? "bg-purple-400 text-black border-purple-400"
                              : "border-white/20 text-white/50 hover:text-white hover:bg-white/5"
                          }`}
                          style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                          {editingUserId === user.id ? "Cancel" : "Edit Role"}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id, user.email)}
                          className="text-xs border border-red-500/40 text-red-400/60 rounded-full px-3 py-1.5 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500 transition"
                          style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Inline role editor */}
                  {editingUserId === user.id && (
                    <tr className="bg-zinc-900 border-b border-purple-400/20">
                      <td colSpan={5} className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-xs text-white/40 uppercase tracking-widest" style={{ fontFamily: "Work Sans, sans-serif" }}>
                            Change role for <span className="text-white/70">{user.email}</span>:
                          </p>
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="bg-zinc-800 border border-white/20 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-400 transition"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                          <button
                            onClick={() => saveRole(user.id)}
                            disabled={savingRole}
                            className="rounded-full bg-purple-400 text-black px-5 py-2 text-sm font-medium hover:bg-purple-500 disabled:opacity-40 transition"
                            style={{ fontFamily: "Work Sans, sans-serif" }}
                          >
                            {savingRole ? "Saving..." : "Save"}
                          </button>
                          <p className="text-xs text-white/20" style={{ fontFamily: "Work Sans, sans-serif" }}>
                            Full UID: <span className="font-mono">{user.id}</span>
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}