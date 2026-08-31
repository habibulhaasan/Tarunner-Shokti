"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Users, Target, Eye, Rocket, MapPin, Mail, Phone,
  ArrowRight, Smartphone, Download, Sparkles, Bell, ChevronRight, FileText
} from "lucide-react";
import { usePublicCommitteeMembers } from "../lib/committee";
import { useVisibleMemos } from "../lib/memos";
import { defaultAvatarFor } from "../lib/photoUtils";

function avatarFor(profile) {
  if (!profile) return defaultAvatarFor('unknown');
  return profile.photo?.useDefault === false && profile.photo?.base64
    ? profile.photo.base64
    : defaultAvatarFor(profile.gender);
}

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return d;
  }
}

const MISSION_CARDS = [
  {
    icon: Target,
    title: "লক্ষ্য",
    desc: "দেশের সকল ফার্মাসিস্টকে একটি ঐক্যবদ্ধ ও শক্তিশালী নেটওয়ার্কের আওতায় নিয়ে আসা, পেশাগত মর্যাদা ও কল্যাণ নিশ্চিত করা এবং স্বাস্থ্যসেবা খাতে ইতিবাচক ভূমিকা রাখা।",
  },
  {
    icon: Eye,
    title: "ভিশন",
    desc: "এমন একটি বাংলাদেশ গড়া, যেখানে প্রতিটি ফার্মাসিস্ট যোগ্য পেশাগত মর্যাদা, নিরাপদ কর্মপরিবেশ ও সমান সুযোগ পাবেন — এবং তরুণ ফার্মাসিস্টরাই নেতৃত্ব দেবেন।",
  },
  {
    icon: Rocket,
    title: "ভবিষ্যৎ পরিকল্পনা",
    desc: "নিয়মিত রক্তদান ক্যাম্প, পেশাগত প্রশিক্ষণ ও সেমিনার, সদস্য কল্যাণ তহবিল সম্প্রসারণ এবং সরকারি-বেসরকারি পর্যায়ে ফার্মাসিস্টদের অধিকার আদায়ে প্রতিনিধিত্ব।",
  },
];

export default function LandingPage() {
  const { members, ready: committeeReady } = usePublicCommitteeMembers();
  const { items: memos, ready: memosReady } = useVisibleMemos();

  // Find the top two roles: সভাপতি and মহাসচিব
  const president = members.find(m => m.committeeRole?.title === "সভাপতি");
  const secretary = members.find(m => m.committeeRole?.title === "মহাসচিব");
  
  // Get the most recent notice
  const recentNotice = memos && memos.length > 0 ? memos[0] : null;

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
          <a href="#mission" className="landing-nav-link">লক্ষ্য ও ভিশন</a>
          <Link href="/about-us" className="landing-nav-link">আমাদের কথা</Link>
          <Link href="/committee" className="landing-nav-link">কমিটি</Link>
          <Link href="/notices" className="landing-nav-link">নোটিশ</Link>
          <a href="#contact" className="landing-nav-link">যোগাযোগ</a>
          <Link href="/login" className="landing-nav-link">লগ ইন</Link>
          <Link href="/register" className="btn landing-nav-cta">রেজিস্টার</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero animate-fade-in">
        <div className="landing-hero-badge">
          <Sparkles size={14} />
          <span>তরুণ ফার্মাসিস্টদের ঐক্যবদ্ধ প্ল্যাটফর্ম</span>
        </div>
        <h1 className="landing-hero-title">
          তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ
          <br />
          <span className="hero-highlight">অরাজনৈতিক ও তরুণ পেশাজীবি সংগঠন</span>
        </h1>
        <p className="landing-hero-sub">
          দেশজুড়ে ফার্মাসিস্টদের পেশাগত মর্যাদা, কল্যাণ ও ঐক্যের প্ল্যাটফর্ম।
        </p>

        <div className="landing-hero-actions">
          <Link href="/register" className="btn btn-primary-blue">
            সদস্য হোন <ArrowRight size={17} />
          </Link>
          <Link href="/about-us" className="btn btn-secondary-slate">
            আমাদের কথা
          </Link>
        </div>

        {/* Android App Download Button */}
        <div className="landing-hero-app-download">
          <a href="/TarunnerShokti.apk" download className="app-download-btn">
            <div className="app-download-icon">
              <Smartphone size={22} />
              <div className="download-badge">
                <Download size={10} strokeWidth={3} />
              </div>
            </div>
            <div className="app-download-text">
              <span>অ্যান্ড্রয়েড অ্যাপ</span>
              <strong>ডাউনলোড করুন</strong>
            </div>
          </a>
        </div>
      </section>

      {/* Leadership / Key Committee Showcase */}
      <section className="landing-features" style={{ paddingBottom: "30px" }}>
        <div className="section-header-center" style={{ marginBottom: "28px" }}>
          <span className="section-subtitle">আমাদের নেতৃত্ব</span>
          <h2 className="landing-section-title">কেন্দ্রীয় কার্যনির্বাহী সংসদ (২০২৫-২০২৬)</h2>
        </div>
        <div className="landing-features-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", maxWidth: "760px", margin: "0 auto 28px" }}>
          <div className="landing-feature-card" style={{ textAlign: "center", padding: "32px 24px" }}>
            <div style={{ width: "80px", height: "80px", margin: "0 auto 16px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", border: "2px solid #bfdbfe", overflow: "hidden", position: "relative" }}>
              {president ? (
                <img src={avatarFor(president)} alt="সভাপতি" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Users size={36} />
              )}
            </div>
            <h3 style={{ fontSize: "18px", marginBottom: "4px", color: "#0f172a" }}>
              {committeeReady ? (president?.nameBn || president?.name || "-") : "লোড হচ্ছে..."}
            </h3>
            <p style={{ color: "#2563eb", fontWeight: "700", fontSize: "15px", margin: 0 }}>সভাপতি</p>
          </div>
          <div className="landing-feature-card" style={{ textAlign: "center", padding: "32px 24px" }}>
            <div style={{ width: "80px", height: "80px", margin: "0 auto 16px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", border: "2px solid #bfdbfe", overflow: "hidden", position: "relative" }}>
               {secretary ? (
                <img src={avatarFor(secretary)} alt="মহাসচিব" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Users size={36} />
              )}
            </div>
            <h3 style={{ fontSize: "18px", marginBottom: "4px", color: "#0f172a" }}>
              {committeeReady ? (secretary?.nameBn || secretary?.name || "-") : "লোড হচ্ছে..."}
            </h3>
            <p style={{ color: "#2563eb", fontWeight: "700", fontSize: "15px", margin: 0 }}>মহাসচিব</p>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link href="/committee" className="btn btn-secondary-slate">
            পূর্ণাঙ্গ কমিটি দেখুন <ChevronRight size={17} style={{ marginLeft: "4px" }} />
          </Link>
        </div>
      </section>

      {/* Recent Notice Section */}
      <section className="landing-features" style={{ paddingTop: "20px", paddingBottom: "50px" }}>
        <div className="landing-feature-card" style={{ maxWidth: "860px", margin: "0 auto", padding: "32px", borderLeft: "5px solid #2563eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", background: "#eff6ff", borderRadius: "8px", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: "19px", color: "#0f172a" }}>সাম্প্রতিক নোটিশ</h3>
            </div>
            <span style={{ fontSize: "13px", color: "#2563eb", background: "#eff6ff", fontWeight: "600", padding: "4px 12px", borderRadius: "20px", border: "1px solid #bfdbfe" }}>
              {recentNotice ? "নতুন বিজ্ঞপ্তি" : "বিজ্ঞপ্তি"}
            </span>
          </div>
          
          {!memosReady ? (
            <p style={{ color: "#64748b", fontSize: "15px", textAlign: "center", padding: "20px 0" }}>নোটিশ লোড হচ্ছে...</p>
          ) : recentNotice ? (
             <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={14} />
                  <span>{recentNotice.memoNo}</span>
                  <span>•</span>
                  <span>{fmtDate(recentNotice.date)}</span>
                </div>
                <h4 style={{ fontSize: "17px", color: "#0f172a", marginBottom: "10px", fontWeight: "700" }}>
                  {recentNotice.title}
                </h4>
                {recentNotice.content && (
                  <p style={{ color: "#475569", fontSize: "14.5px", lineHeight: "1.7", marginBottom: "20px", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {recentNotice.content}
                  </p>
                )}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Link href={`/memo/${recentNotice.id}`} className="btn-primary-blue" style={{ display: "inline-flex", padding: "9px 18px", fontSize: "14px", textDecoration: "none" }}>
                    নোটিশটি বিস্তারিত পড়ুন <ChevronRight size={16} style={{ marginLeft: "4px" }} />
                  </Link>
                  <Link href="/notices" className="btn-secondary-slate" style={{ display: "inline-flex", padding: "9px 18px", fontSize: "14px", textDecoration: "none" }}>
                    সকল নোটিশ <ArrowRight size={16} style={{ marginLeft: "6px" }} />
                  </Link>
                </div>
             </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ color: "#475569", fontSize: "14.5px", marginBottom: "20px" }}>
                এখনও কোনো স্মারক প্রকাশ করা হয়নি।
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section id="mission" className="landing-features">
        <div className="section-header-center">
          <span className="section-subtitle">আমাদের লক্ষ্য ও উদ্দেশ্য</span>
          <h2 className="landing-section-title">ফার্মাসিস্টদের সমৃদ্ধ ভবিষ্যতের অঙ্গীকার</h2>
        </div>
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

      {/* Call To Action Banner */}
      <section className="landing-cta-banner">
        <div className="landing-cta-inner">
          <h2>আপনি কি একজন ফার্মাসিস্ট?</h2>
          <p>আপনার পেশাগত মর্যাদা ও অধিকার সুনিশ্চিত করতে আজই তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদে যোগ দিন।</p>
          <div className="cta-action-group">
            <Link href="/register" className="btn btn-primary-blue">
              সদস্য হোন <ArrowRight size={17} />
            </Link>
            <Link href="/login" className="btn btn-secondary-slate" style={{ background: "", color: "#ffffff", borderColor: "#334155" }}>
              সদস্য লগ ইন
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="landing-contact-section">
        <div className="landing-contact-inner">
          <h2 className="landing-section-title">যোগাযোগ করুন</h2>
          <div className="landing-contact-grid">
            <div className="contact-item">
              <div className="contact-icon"><MapPin size={20} /></div>
              <div>
                <strong>অস্থায়ী কার্যালয়</strong>
                <p>মাতৃসদন ও শিশু স্বাস্থ্য প্রশিক্ষণ প্রতিষ্ঠান, আজিমপুর, ঢাকা</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><Mail size={20} /></div>
              <div>
                <strong>ইমেইল</strong>
                <p><a href="mailto:info.tarunnershokti@gmail.com">info.tarunnershokti@gmail.com</a></p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><Phone size={20} /></div>
              <div>
                <strong>ফোন নম্বর</strong>
                <p><a href="tel:01734228830">01734228830</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        © {new Date().getFullYear()} তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ। সর্বস্বত্ব সংরক্ষিত।
      </footer>
    </div>
  );
}
