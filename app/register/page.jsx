// File: app/register/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { syncSessionCookie } from "../../lib/sessionCookie";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }
    if (form.password !== form.confirm) {
      setError("পাসওয়ার্ড মিলছে না।");
      return;
    }

    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });

      await setDoc(doc(db, "users", cred.user.uid), {
        email: form.email,
        role: "user",
        profileComplete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Store name + email now so onboarding can pre-fill, and so the
      // directory (which can't read other users' `users/{uid}` docs) has
      // an email to show when a member opts into visibility.email
      await setDoc(
        doc(db, "profiles", cred.user.uid),
        { name: form.name, email: form.email, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
        { merge: true }
      );

      await syncSessionCookie(cred.user);

      // Hard navigation, not router.replace — see app/login/page.jsx.
      window.location.href = "/onboarding";
    } catch (err) {
      setError(err.code ? friendlyError(err.code) : err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <div className="auth-hero-mark">
        <div className="auth-hero-logo-wrap">
          <Image src="/logo.png" alt="তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ" fill className="auth-hero-logo" sizes="180px" />
        </div>          তারুণ্যের শক্তি
        </div>
        <div>
          <h1 className="auth-hero-title">
            খুঁজে নিন আপনার
            <br />
            সহকর্মী ফার্মাসিস্টদের।
          </h1>
          <p className="auth-hero-sub">
            তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ-এর সকল সদস্যের জন্য একটি অভিন্ন প্ল্যাটফর্ম।
          </p>
        </div>
        <div />
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="auth-card-logo-wrap">
          <Image src="/logo.png" alt="তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ" fill className="auth-card-logo" sizes="64px" />
        </div>
          <h1 className="auth-card-text">অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="subtitle">প্রাথমিক তথ্য দিয়ে শুরু করুন — পরে সম্পূর্ণ প্রোফাইল করবেন।</p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>পূর্ণ নাম</label>
              <input type="text" required value={form.name} onChange={update("name")} placeholder="সার্টিফিকেটে যেমন আছে" />
            </div>
            <div className="field">
              <label>ইমেইল</label>
              <input type="email" required value={form.email} onChange={update("email")} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>পাসওয়ার্ড</label>
              <input type="password" required value={form.password} onChange={update("password")} placeholder="কমপক্ষে ৬ অক্ষর" />
            </div>
            <div className="field">
              <label>পাসওয়ার্ড নিশ্চিত করুন</label>
              <input type="password" required value={form.confirm} onChange={update("confirm")} />
            </div>
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "অ্যাকাউন্ট তৈরি হচ্ছে…" : "অ্যাকাউন্ট তৈরি করুন"}
            </button>
          </form>

          <div className="auth-switch">
            আগে থেকেই নিবন্ধিত? <Link href="/login">লগ ইন করুন</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function friendlyError(code) {
  const map = {
    "auth/email-already-in-use": "এই ইমেইল দিয়ে আগেই একটি অ্যাকাউন্ট আছে — লগ ইন করে দেখুন।",
    "auth/invalid-email": "ইমেইল ঠিকানাটি সঠিক মনে হচ্ছে না।",
    "auth/weak-password": "আরেকটু শক্তিশালী পাসওয়ার্ড দিন।",
  };
  return map[code] || "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।";
}