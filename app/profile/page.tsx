"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";

// profile data type
type ProfileData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

// need to add validation on profile page
export default function ProfilePage() {
  const router = useRouter();

  // user and loading states
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // saving state for button
  const [saving, setSaving] = useState(false);

  // message shown to user
  const [message, setMessage] = useState("");

  // form values
  const [form, setForm] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  // get current user and load data from firestore
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

          // fill form with saved data
          setForm({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || "",
            email: currentUser.email || "",
          });
        } else {
          // no data yet
          setForm({
            firstName: "",
            lastName: "",
            phone: "",
            email: currentUser.email || "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // update form when typing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // save profile data to firestore
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage("");

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          updatedAt: new Date(),
        },
        { merge: true } // keep old data
      );

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to save profile:", error);
      setMessage("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white px-6 py-16">
        <div className="max-w-2xl mx-auto">
          {/* page title */}
          <h1 className="text-4xl font-semibold mb-3">Profile Settings</h1>

          <p className="text-white/60 mb-10">
            Update your personal information below.
          </p>

          {loading ? (
            <div className="text-white/70">Loading profile...</div>
          ) : !user ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-white/80 mb-4">
                You need to sign in to access your profile settings.
              </p>

              {/* go to login */}
              <button
                onClick={() => router.push("/login")}
                className="rounded-xl border border-white/20 px-5 py-3 hover:bg-white hover:text-black transition"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-6">
              {/* name inputs */}
              <div className="grid md:grid-cols-2 gap-5">
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
                    className="w-full rounded-xl bg-zinc-900 border border-white/15 px-4 py-3 outline-none focus:border-white/40"
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
                    className="w-full rounded-xl bg-zinc-900 border border-white/15 px-4 py-3 outline-none focus:border-white/40"
                  />
                </div>
              </div>

              {/* phone input */}
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
                  className="w-full rounded-xl bg-zinc-900 border border-white/15 px-4 py-3 outline-none focus:border-white/40"
                />
              </div>

              {/* email input */}
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full rounded-xl bg-zinc-900 border border-white/15 px-4 py-3 outline-none focus:border-white/40"
                />
              </div>

              {/* message */}
              {message && (
                <div className="text-sm text-white/70 border border-white/10 rounded-xl px-4 py-3 bg-white/5">
                  {message}
                </div>
              )}

              {/* save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-white text-black px-6 py-3 font-medium hover:opacity-90 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
