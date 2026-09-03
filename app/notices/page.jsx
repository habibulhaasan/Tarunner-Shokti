"use client";

import Link from "next/link";
import Image from "next/image";
import { FileText } from "lucide-react";
import { useVisibleMemos } from "../../lib/memos";

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return d;
  }
}

export default function NoticesPage() {
  const { items: memos, ready: memosReady } = useVisibleMemos();

  return (
    <div className="landing-shell">
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
          <Link href="/notices" className="landing-nav-link active">নোটিশ</Link>
          <Link href="/constitution" className="landing-nav-link">গঠনতন্ত্র</Link>
          <Link href="/#contact" className="landing-nav-link">যোগাযোগ</Link>
          <Link href="/login" className="landing-nav-link">লগ ইন</Link>
          <Link href="/register" className="btn landing-nav-cta">রেজিস্টার</Link>
        </div>
      </nav>

      <section className="landing-features" style={{ minHeight: "60vh" }}>
        <h2 className="landing-section-title">
          <FileText size={22} style={{ verticalAlign: "-4px", marginRight: 8 }} />
          প্রকাশিত স্মারক ও নোটিশ
        </h2>
        {!memosReady && <p className="helper-text" style={{ textAlign: "center" }}>লোড হচ্ছে…</p>}
        {memosReady && memos.length === 0 && (
          <p className="helper-text" style={{ textAlign: "center" }}>এখনও কোনো স্মারক প্রকাশ করা হয়নি।</p>
        )}
        <div className="fund-review-list" style={{ marginTop: 24, maxWidth: 800, marginLeft: "auto", marginRight: "auto" }}>
          {memos.map((m) => (
            <div key={m.id} className="fund-review-card">
              <div className="fund-review-top">
                <div>
                  <div className="fund-review-donor">{m.memoNo}</div>
                  <div className="fund-review-meta">{m.title} · {fmtDate(m.date)}</div>
                </div>
              </div>
              <div className="fund-review-actions">
                <Link href={`/memo/${m.id}`} target="_blank" className="btn-ghost btn" style={{ width: "auto" }}>
  দেখুন / প্রিন্ট করুন
</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ। সর্বস্বত্ব সংরক্ষিত।
        <span className="landing-footer-developer">
          Developed by <strong>Code Caplet™</strong> · <a href="mailto:lab.codecaplet@gmail.com">lab.codecaplet@gmail.com</a>
        </span>
      </footer>
    </div>
  );
}