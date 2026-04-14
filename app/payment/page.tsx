"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";

type ProfileData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const [form, setForm] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();

          setForm({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || "",
            email: data.email || currentUser.email || "",
          });
        } else {
          setForm({
            firstName: "",
            lastName: "",
            phone: "",
            email: currentUser.email || "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setMessage("Failed to load profile data.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();

    setMessage("");
    setMessageType("");

    if (!firstName || !lastName) {
      setMessage("First name and last name are required.");
      setMessageType("error");
      return;
    }

    if (firstName.length < 2) {
      setMessage("First name must be at least 2 characters.");
      setMessageType("error");
      return;
    }

    if (lastName.length < 2) {
      setMessage("Last name must be at least 2 characters.");
      setMessageType("error");
      return;
    }

    if (!/^[A-Za-z\s'-]+$/.test(firstName)) {
      setMessage("First name contains invalid characters.");
      setMessageType("error");
      return;
    }

    if (!/^[A-Za-z\s'-]+$/.test(lastName)) {
      setMessage("Last name contains invalid characters.");
      setMessageType("error");
      return;
    }

    if (!phone) {
      setMessage("Phone number is required.");
      setMessageType("error");
      return;
    }

    if (!/^\+?[0-9\s\-()]{10,20}$/.test(phone)) {
      setMessage("Please enter a valid phone number.");
      setMessageType("error");
      return;
    }

    if (!email) {
      setMessage("Email address is required.");
      setMessageType("error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          firstName,
          lastName,
          phone,
          email,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setForm({
        firstName,
        lastName,
        phone,
        email,
      });

      setMessage("Profile updated successfully.");
      setMessageType("success");
    } catch (error) {
      console.error("Failed to save profile:", error);
      setMessage("Something went wrong while saving.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white pt-28 px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-white/40 mb-3">
              Account
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold mb-3">
              Profile Settings
            </h1>
            <p className="text-white/60 max-w-xl">
              Update your personal information and keep your account details up
              to date.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-8">
              <p className="text-white/70">Loading profile...</p>
            </div>
          ) : !user ? (
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-8">
              <p className="text-white/80 mb-4">
                You need to sign in to view your profile settings.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="rounded-xl bg-white text-black px-5 py-3 font-medium hover:bg-white/90 transition"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-8 md:p-10 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-2xl font-semibold">
                  {form.firstName
                    ? form.firstName.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <div>
                  <h2 className="text-2xl font-semibold">
                    {form.firstName || form.lastName
                      ? `${form.firstName} ${form.lastName}`.trim()
                      : "Your Profile"}
                  </h2>
                  <p className="text-white/50 mt-1">
                    Manage your personal details below.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    className="w-full rounded-xl bg-black border border-white/10 px-4 py-3 text-white outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    className="w-full rounded-xl bg-black border border-white/10 px-4 py-3 text-white outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full rounded-xl bg-black border border-white/10 px-4 py-3 text-white outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full rounded-xl bg-black border border-white/10 px-4 py-3 text-white outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`mt-6 rounded-xl px-4 py-3 text-sm border ${
                    messageType === "success"
                      ? "bg-green-500/10 text-green-300 border-green-500/20"
                      : "bg-red-500/10 text-red-300 border-red-500/20"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
