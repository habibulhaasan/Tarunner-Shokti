"use client";

import Link from "next/link";
import Image from "next/image";
import { FolderArchive } from "lucide-react";
import ArchiveTab from "../../components/dashboard/ArchiveTab";

export default function ArchivePage() {
  return (
    <div className="landing-shell">
      {/* Navigation Header */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div className="landing-nav-logo-wrap">
              <Image src="/logo.png" alt="তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ" fill className="landing-nav-logo" sizes="36px" priority />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span className="landing-brand-text" style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", lineHeight: "1.2", textDecoration: "none" }}>
                তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ
              </span>
              <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#64748b", marginTop: "2px", textDecoration: "none" }}>
                অরাজনৈতিক ও তরুণ পেশাজীবি সংগঠন
              </span>
            </div>
          </Link>
        </div>
        <div className="landing-nav-actions">
          <Link href="/#mission" className="landing-nav-link">লক্ষ্য ও ভিশন</Link>
          <Link href="/about-us" className="landing-nav-link">আমাদের কথা</Link>
          <Link href="/committee" className="landing-nav-link">কমিটি</Link>
          <Link href="/notices" className="landing-nav-link">নোটিশ</Link>
          <Link href="/constitution" className="landing-nav-link">গঠনতন্ত্র</Link>
          <Link href="/archive" className="landing-nav-link active">আর্কাইভ</Link>
          <Link href="/#contact" className="landing-nav-link">যোগাযোগ</Link>
          <Link href="/login" className="landing-nav-link">লগ ইন</Link>
          <Link href="/register" className="btn landing-nav-cta">রেজিস্টার</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "32px 20px 60px" }}>
        <ArchiveTab />
      </div>

      {/* Footer */}
      <footer className="landing-footer" style={{ borderTop: "1px solid var(--border)", padding: "28px 20px", textAlign: "center" }}>
        <div className="landing-footer-copy" style={{ fontSize: 13, color: "var(--muted)" }}>
          © {new Date().getFullYear()} তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </footer>
    </div>
  );
}

