"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Users, Target, Eye, Rocket, MapPin, Mail, Phone,
  ArrowRight, Smartphone, Download, Sparkles, Bell, ChevronRight, FileText,
  Globe
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

  // Find key leadership roles: সভাপতি, মহাসচিব, and সাংগঠনিক সম্পাদক
  const president = members.find(m => m.committeeRole?.title === "সভাপতি");
  const secretary = members.find(m => m.committeeRole?.title === "মহাসচিব");
  const organizingSecretary = members.find(m => m.committeeRole?.title === "সাংগঠনিক সম্পাদক");
  
  // Get recent notices (up to 3 for list view)
  const recentMemos = (memos || []).slice(0, 3);

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
          <Link href="/constitution" className="landing-nav-link">গঠনতন্ত্র</Link>
          <a href="#contact" className="landing-nav-link">যোগাযোগ</a>
          <Link href="/login" className="landing-nav-link">লগ ইন</Link>
          <Link href="/register" className="btn landing-nav-cta">রেজিস্টার</Link>
        </div>
      </nav>

      {/* Hero Section (Individual) */}
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

      {/* One Row, Double Column: সাম্প্রতিক নোটিশ (Left ~65%) & আমাদের নেতৃত্ব (Right ~35%) */}
      <section className="landing-features landing-spotlight-section">
        <div className="landing-spotlight-grid">
          {/* Left Column: Recent Notice (সাম্প্রতিক নোটিশ - List View) */}
          <div className="landing-spotlight-card landing-notice-spotlight-card">
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", background: "#eff6ff", borderRadius: "8px", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <span className="section-subtitle" style={{ display: "block", fontSize: "11.5px", lineHeight: "1.2" }}>বিজ্ঞপ্তি ও স্মারক</span>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>সাম্প্রতিক নোটিশ</h3>
                  </div>
                </div>
                <span style={{ fontSize: "12px", color: "#2563eb", background: "#eff6ff", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", border: "1px solid #bfdbfe" }}>
                  {recentMemos.length > 0 ? "নতুন বিজ্ঞপ্তি" : "বিজ্ঞপ্তি"}
                </span>
              </div>

              {!memosReady ? (
                <p style={{ color: "#64748b", fontSize: "14.5px", textAlign: "center", padding: "28px 0" }}>নোটিশ লোড হচ্ছে...</p>
              ) : recentMemos.length > 0 ? (
                <div className="landing-notice-list">
                  {recentMemos.map((memo) => (
                    <div key={memo.id} className="landing-notice-row">
                      <div className="landing-notice-row-left">
                        <span className="landing-notice-topic-badge">
                          {memo.topic || "বিজ্ঞপ্তি"}
                        </span>
                        <span className="landing-notice-row-title" title={memo.title}>
                          {memo.title}
                        </span>
                      </div>
                      <Link
                        href={`/memo/${memo.id}`}
                        className="landing-notice-view-btn"
                        title="নোটিশটি বিস্তারিত দেখুন"
                      >
                        দেখুন <ChevronRight size={13} />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "28px 0" }}>
                  <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                    এখনও কোনো স্মারক প্রকাশ করা হয়নি।
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f1f5f9", textAlign: "right" }}>
              <Link href="/notices" className="btn btn-secondary-slate" style={{ display: "inline-flex", padding: "8px 14px", fontSize: "13px", textDecoration: "none" }}>
                সকল নোটিশ দেখুন <ArrowRight size={15} style={{ marginLeft: "4px" }} />
              </Link>
            </div>
          </div>

          {/* Right Column: Leadership Showcase (আমাদের নেতৃত্ব) */}
          <div className="landing-spotlight-card landing-leaders-spotlight-card">
            <div>
              <div style={{ marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <span className="section-subtitle" style={{ display: "block", fontSize: "11.5px", lineHeight: "1.2", marginBottom: "2px" }}>আমাদের নেতৃত্ব</span>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
                    কেন্দ্রীয় কার্যনির্বাহী সংসদ
                  </h3>
                </div>
                <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "600", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "2px 8px", borderRadius: "6px" }}>
                  ২০২৬-২০২৯
                </span>
              </div>

              <div className="landing-leaders-column-list">
                {[
                  { role: "সভাপতি", person: president },
                  { role: "মহাসচিব", person: secretary },
                  { role: "সাংগঠনিক সম্পাদক", person: organizingSecretary },
                ].map(({ role, person }) => (
                  <div key={role} className="landing-leader-row-card">
                    <div className="landing-leader-avatar-wrap">
                      {person ? (
                        <img
                          src={avatarFor(person)}
                          alt={role}
                          className="landing-leader-avatar-img"
                        />
                      ) : (
                        <Users size={22} color="#2563eb" />
                      )}
                    </div>
                    <div className="landing-leader-info">
                      <span className="landing-leader-role-badge">{role}</span>
                      <h4 className="landing-leader-name">
                        {committeeReady ? (person?.nameBn || person?.name || "-") : "লোড হচ্ছে..."}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
              <Link
                href="/committee"
                className="btn btn-secondary-slate"
                style={{ width: "100%", justifyContent: "center", fontSize: "13px", padding: "8px 14px" }}
              >
                পূর্ণাঙ্গ কমিটি দেখুন <ChevronRight size={15} style={{ marginLeft: "4px" }} />
              </Link>
            </div>
          </div>
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
            <div className="contact-item">
              <div className="contact-icon"><Globe size={20} /></div>
              <div>
                <strong>ফেসবুক</strong>
                <p style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "4px" }}>
                  <a
                    href="https://www.facebook.com/profile.php?id=61593973204688"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#1877F2", fontWeight: "600", textDecoration: "none" }}
                  >
                    <Globe size={16} /> পেজ
                  </a>
                  <a
                    href="https://www.facebook.com/groups/1227142839002006"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#1877F2", fontWeight: "600", textDecoration: "none" }}
                  >
                    <Users size={16} /> গ্রুপ
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        © {new Date().getFullYear()} তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ। সর্বস্বত্ব সংরক্ষিত।
        <span className="landing-footer-developer">
          Developed by <strong>Code Caplet™</strong> · <a href="mailto:lab.codecaplet@gmail.com">lab.codecaplet@gmail.com</a>
        </span>
      </footer>
    </div>
  );
}
