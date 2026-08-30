"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Users, Droplet, Bell, ShieldCheck, HeartHandshake, Landmark, FileText,
  Download, Smartphone, Target, Eye, Rocket, MapPin, Mail, Phone,
} from "lucide-react";

const FEATURES = [
  { icon: Users, title: "সদস্য ডিরেক্টরি", desc: "দেশজুড়ে সকল সদস্যের তথ্য এক জায়গায় — বিভাগ, কর্মস্থল ও ঠিকানা অনুযায়ী খুঁজে নিন।" },
  { icon: Droplet, title: "রক্তদান নেটওয়ার্ক", desc: "জরুরি প্রয়োজনে রক্তের গ্রুপ অনুযায়ী সদস্য খুঁজে বের করুন, নিজের রক্তদানের তথ্যও রাখুন।" },
  { icon: HeartHandshake, title: "কল্যাণ তহবিল", desc: "স্বচ্ছভাবে অনুদান সংগ্রহ, অনুমোদন ও ব্যয়ের হিসাব — সবকিছু ট্র্যাক করা যায়।" },
  { icon: Landmark, title: "পরিচালনা পরিষদ", desc: "কমিটির সদস্য ও তাদের দায়িত্ব সম্পর্কে স্বচ্ছ তথ্য।" },
  { icon: FileText, title: "স্মারক ও নোটিশ", desc: "অফিসিয়াল স্মারক নং সহ নোটিশ প্রকাশ ও প্রিন্ট করার সুবিধা।" },
  { icon: Bell, title: "রিয়াল-টাইম নোটিফিকেশন", desc: "গুরুত্বপূর্ণ আপডেট সঙ্গে সঙ্গে পৌঁছে যাবে আপনার কাছে।" },
];

const MISSION_CARDS = [
  {
    icon: Target,
    title: "লক্ষ্য",
    desc: "দেশের সকল ফার্মাসিস্টকে একটি ঐক্যবদ্ধ ও শক্তিশালী নেটওয়ার্কের আওতায় নিয়ে আসা, পেশাগত মর্যাদা ও কল্যাণ নিশ্চিত করা এবং স্বাস্থ্যসেবা খাতে ইতিবাচক ভূমিকা রাখা।",
  },
  {
    icon: Eye,
    title: "ভিশন",
    desc: "এমন একটি বাংলাদেশ গড়া, যেখানে প্রতিটি ফার্মাসিস্ট যোগ্য পেশাগত মর্যাদা, নিরাপদ কর্মপরিবেশ ও সমান সুযোগ পাবেন — এবং তরুণ ফার্মাসিস্টরাই নেতৃত্ব দেবেন দেশের ভবিষ্যৎ স্বাস্থ্যখাতে।",
  },
  {
    icon: Rocket,
    title: "ভবিষ্যৎ পরিকল্পনা",
    desc: "নিয়মিত রক্তদান ক্যাম্প, পেশাগত প্রশিক্ষণ ও সেমিনার, সদস্য কল্যাণ তহবিল সম্প্রসারণ এবং সরকারি-বেসরকারি পর্যায়ে ফার্মাসিস্টদের অধিকার আদায়ে প্রতিনিধিত্ব।",
  },
];

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="landing-nav-logo-wrap">
            <Image src="/logo.png" alt="তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ" fill className="landing-nav-logo" sizes="32px" />
          </div>
          তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ
        </div>
        <div className="landing-nav-actions">
          <a href="#mission" className="landing-nav-link">লক্ষ্য ও উদ্দেশ্য</a>
          <a href="#features" className="landing-nav-link">সুবিধাসমূহ</a>
          <Link href="/committee" className="landing-nav-link">কমিটি</Link>
          <Link href="/notices" className="landing-nav-link">নোটিশ</Link>
          <a href="#contact" className="landing-nav-link">যোগাযোগ</a>
          <Link href="/login" className="landing-nav-link">লগ ইন</Link>
          <Link href="/register" className="btn landing-nav-cta">রেজিস্টার করুন</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-logo-wrap">
          <Image src="/logo.png" alt="তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ" fill className="landing-hero-logo" sizes="84px" />
        </div>
        <h1 className="landing-hero-title">
          তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ
          <br />
          সকল ফার্মাসিস্ট এক প্ল্যাটফর্মে।
        </h1>
        <p className="landing-hero-sub">
          দেশজুড়ে ফার্মাসিস্টদের পেশাগত মর্যাদা, কল্যাণ ও ঐক্যের জন্য একটি অভিন্ন
          ডিজিটাল প্ল্যাটফর্ম — ডিরেক্টরি, রক্তদান নেটওয়ার্ক, কল্যাণ তহবিল ও আরও অনেক কিছু।
        </p>

        <div className="landing-hero-actions">
          <Link href="/register" className="btn landing-hero-btn">রেজিস্টার করুন</Link>
          <Link href="/login" className="btn-ghost btn landing-hero-btn">লগ ইন করুন</Link>
        </div>

        <div className="landing-hero-app-download">
          <a href="/TarunnerShokti.apk" download className="app-download-btn">
            <div className="app-download-icon">
              <Smartphone size={28} />
              <div className="download-badge">
                <Download size={12} strokeWidth={3} />
              </div>
            </div>
            <div className="app-download-text">
              <span>অ্যান্ড্রয়েড অ্যাপ</span>
              <strong>ডাউনলোড করুন</strong>
            </div>
          </a>
        </div>
      </section>

      <section id="mission" className="landing-features">
        <h2 className="landing-section-title">লক্ষ্য, ভিশন ও ভবিষ্যৎ পরিকল্পনা</h2>
        <div className="landing-features-grid">
          {MISSION_CARDS.map((m) => (
            <div key={m.title} className="landing-feature-card">
              <div className="landing-feature-icon"><m.icon size={22} /></div>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="landing-features">
        <h2 className="landing-section-title">প্ল্যাটফর্মে যা যা পাবেন</h2>
        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="landing-feature-card">
              <div className="landing-feature-icon"><f.icon size={22} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" style={{ background: "var(--white)", borderTop: "1px solid var(--line)", padding: "54px 24px 64px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h2 className="landing-section-title" style={{ marginBottom: "28px" }}>যোগাযোগ</h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "20px 40px", fontSize: "15px", color: "#334155" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={18} style={{ color: "var(--coral)", flexShrink: 0 }} />
              <span><strong>অস্থায়ী কার্যালয়:</strong> মাতৃ সদন ও শিশু স্বাস্থ্য প্রশিক্ষণ প্রতিষ্ঠান, আজিমপুর, ঢাকা</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Mail size={18} style={{ color: "var(--coral)", flexShrink: 0 }} />
              <a href="mailto:info.tarunnershokti@gmail.com" style={{ color: "var(--coral)", textDecoration: "none", fontWeight: 600 }}>info.tarunnershokti@gmail.com</a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Phone size={18} style={{ color: "var(--coral)", flexShrink: 0 }} />
              <a href="tel:01734228830" style={{ color: "var(--coral)", textDecoration: "none", fontWeight: 600 }}>01734228830</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ। সর্বস্বত্ব সংরক্ষিত।
      </footer>
    </div>
  );
}
