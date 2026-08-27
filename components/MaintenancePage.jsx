"use client";

import Image from "next/image";
import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="screen-center" style={{ flexDirection: "column", gap: 18, padding: 24, textAlign: "center" }}>
      <div style={{ width: 72, height: 72, position: "relative" }}>
        <Image src="/logo.png" alt="" fill style={{ objectFit: "contain" }} />
      </div>
      <Wrench size={28} color="var(--coral)" />
      <h1 style={{ fontSize: 22 }}>সাইটটি রক্ষণাবেক্ষণাধীন</h1>
      <p style={{ color: "var(--muted)", maxWidth: 380 }}>
        আমরা কিছু উন্নয়নমূলক কাজ করছি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
        <br />
        We're performing scheduled maintenance. Please check back shortly.
      </p>
    </div>
  );
}