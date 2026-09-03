"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Target, Eye, Rocket, Users, ShieldCheck, Heart, Award, ArrowRight,
  MapPin, Mail, Phone, CheckCircle2, Sparkles, Activity
} from "lucide-react";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "পেশাগত মর্যাদা",
    desc: "ফার্মাসিস্টদের অধিকার রক্ষা এবং স্বাস্থ্যখাতে তাদের প্রকৃত মর্যাদা প্রতিষ্ঠা করতে আমরা প্রতিশ্রুতিবদ্ধ।"
  },
  {
    icon: Heart,
    title: "একতা ও সহমর্মিতা",
    desc: "জরুরি রক্তদান ও কল্যাণ তহবিলের মাধ্যমে প্রতিটি সদস্যের বিপদে পাশে দাঁড়ানো আমাদের অন্যতম মূল্যবোধ।"
  },
  {
    icon: Award,
    title: "দক্ষতা উন্নয়ন",
    desc: "আধুনিক সেমিনার, প্রশিক্ষণ ও গবেষণামূলক আলোচনার মাধ্যমে তরুণদের দক্ষ করে গড়ে তোলা।"
  },
  {
    icon: Activity,
    title: "স্বাস্থ্যসেবায় ডিজিটাল বিপ্লব",
    desc: "প্রযুক্তিভিত্তিক প্ল্যাটফর্মের মাধ্যমে দ্রুত যোগাযোগ ও স্বচ্ছ প্রশাসনিক ব্যবস্থা নিশ্চিতকরণ।"
  }
];

const STATS = [
  { label: "নিবন্ধিত ফার্মাসিস্ট", value: "৫,০০০+" },
  { label: "সক্রিয় রক্তদাতা", value: "১,২০০+" },
  { label: "জেলা নেটওয়ার্ক", value: "৬৪ টি" },
  { label: "সফল সামাজিক উদ্যোগ", value: "১৫০+" }
];

export default function AboutUsPage() {
  return (
    <div className="landing-shell">
      {/* Navigation */}
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
          <Link href="/about-us" className="landing-nav-link active">আমাদের কথা</Link>
          <Link href="/committee" className="landing-nav-link">কমিটি</Link>
          <Link href="/notices" className="landing-nav-link">নোটিশ</Link>
          <Link href="/constitution" className="landing-nav-link">গঠনতন্ত্র</Link>
          <Link href="/#contact" className="landing-nav-link">যোগাযোগ</Link>
          <Link href="/login" className="landing-nav-link">লগ ইন</Link>
          <Link href="/register" className="btn landing-nav-cta">রেজিস্টার</Link>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="about-hero animate-fade-in">
        <div className="about-hero-badge">
          <Sparkles size={15} />
          <span>আমাদের লক্ষ্য ও পথচলা</span>
        </div>
        <h1 className="about-hero-title">
          ফার্মাসিস্টদের কল্যাণ ও পেশাগত <br />
          <span className="hero-highlight">মর্যাদা রক্ষায় আমরা বদ্ধপরিকর</span>
        </h1>
        <p className="about-hero-sub">
          “তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ” দেশের সকল ফার্মাসিস্টকে এক ছাতার নিচে এনে একটি সুসংগঠিত, শক্তিশালী ও সমৃদ্ধ পেশাজীবী সমাজ গঠনে নিরলস কাজ করে যাচ্ছে।
        </p>
      </section>

      {/* Stats Counter Section */}
      <section className="about-stats-container">
        <div className="about-stats-grid">
          {STATS.map((stat, idx) => (
            <div key={idx} className="about-stat-card">
              <h2 className="about-stat-value">{stat.value}</h2>
              <p className="about-stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Story Section */}
      <section className="about-story-section">
        <div className="about-story-container">
          <div className="about-story-content">
            <h2 className="landing-section-title text-left">আমাদের সংগঠনের গল্প</h2>
            <p className="about-story-text">
              স্বাস্থ্যখাতে ফার্মাসিস্টদের ভূমিকা অপরিসীম হলেও উপযুক্ত স্বীকৃতি ও প্লাটফর্মের অভাবে তরুণ ফার্মাসিস্টরা প্রায়শই নিজেদের বিকাশ ও অধিকার আদায়ে চ্যালেঞ্জের সম্মুখীন হন। এই বাস্তবতায় একঝাঁক প্রাণবন্ত ও স্বপ্নবাজ ফার্মাসিস্টদের উদ্যোগে প্রতিষ্ঠিত হয় <strong>“তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ”</strong>।
            </p>
            <p className="about-story-text">
              আমরা বিশ্বাস করি, তরুণদের সততা, মেধা ও উদ্দীপনাই পারে স্বাস্থ্যখাতে একটি বৈপ্লবিক পরিবর্তন আনতে। প্রযুক্তির সহায়তায় আমরা সমগ্র বাংলাদেশের ফার্মাসিস্টদের মধ্যে পারস্পরিক যোগাযোগ স্থাপন, রক্তদান ডিরেক্টরি এবং আপদকালীন কল্যাণ তহবিল পরিচালনা করে আসছি।
            </p>
            <div className="about-highlights-list">
              <div className="highlight-item">
                <CheckCircle2 size={18} className="highlight-icon" />
                <span>স্বচ্ছ ও সুশাসিত সাংগঠনিক কাঠামো</span>
              </div>
              <div className="highlight-item">
                <CheckCircle2 size={18} className="highlight-icon" />
                <span>জরুরি মুহূর্তে ২৪/৭ রক্তদান সহায়তা</span>
              </div>
              <div className="highlight-item">
                <CheckCircle2 size={18} className="highlight-icon" />
                <span>পেশাগত ও প্রাতিষ্ঠানিক অধিকার আদায়ে অদম্য কণ্ঠস্বর</span>
              </div>
            </div>
          </div>
          <div className="about-story-card-visual">
            <div className="visual-badge">
              <Users size={32} />
              <h3>একতাই আমাদের শক্তি</h3>
              <p>সারাদেশের প্রতিভাবান ফার্মাসিস্টদের বৃহত্তম নেটওয়ার্ক</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Vision Future */}
      <section className="landing-features" style={{ paddingTop: "20px" }}>
        <div className="section-header-center">
          <span className="section-subtitle">আমাদের লক্ষ্য ও উদ্দেশ্য</span>
          <h2 className="landing-section-title">ভিশন, মিশন এবং আগামীর পরিকল্পনা</h2>
        </div>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Target size={22} />
            </div>
            <h3>লক্ষ্য</h3>
            <p>
              দেশের সকল ফার্মাসিস্টকে একটি ঐক্যবদ্ধ ও শক্তিশালী নেটওয়ার্কের আওতায় নিয়ে আসা, পেশাগত মর্যাদা ও কল্যাণ নিশ্চিত করা এবং স্বাস্থ্যসেবা খাতে ইতিবাচক ভূমিকা রাখা।
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Eye size={22} />
            </div>
            <h3>ভিশন</h3>
            <p>
              এমন একটি বাংলাদেশ গড়া, যেখানে প্রতিটি ফার্মাসিস্ট যোগ্য পেশাগত মর্যাদা, নিরাপদ কর্মপরিবেশ ও সমান সুযোগ পাবেন — এবং তরুণ ফার্মাসিস্টরাই নেতৃত্ব দেবেন।
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Rocket size={22} />
            </div>
            <h3>ভবিষ্যৎ পরিকল্পনা</h3>
            <p>
              নিয়মিত রক্তদান ক্যাম্প, পেশাগত প্রশিক্ষণ ও সেমিনার, সদস্য কল্যাণ তহবিল সম্প্রসারণ এবং সরকারি-বেসরকারি পর্যায়ে ফার্মাসিস্টদের অধিকার আদায়ে প্রতিনিধিত্ব করা।
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="about-values-section">
        <div className="section-header-center">
          <span className="section-subtitle">আমাদের মূলভিত্তি</span>
          <h2 className="landing-section-title">আমাদের মূল মূল্যবোধসমূহ</h2>
        </div>
        <div className="values-grid">
          {VALUES.map((v, i) => (
            <div key={i} className="value-card">
              <div className="value-icon">
                <v.icon size={22} />
              </div>
              <h4>{v.title}</h4>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Join Call to Action */}
      <section className="about-cta-section">
        <div className="about-cta-box">
          <h2>আপনিও কি একজন ফার্মাসিস্ট?</h2>
          <p>আজই যুক্ত হন তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদে এবং নিশ্চিত করুন আপনার পেশাগত সম্মান ও সমৃদ্ধ ভবিষ্যৎ।</p>
          <div className="about-cta-buttons">
            <Link href="/register" className="btn btn-primary-blue">
              সদস্যপদ নিবন্ধন করুন <ArrowRight size={17} />
            </Link>
            <Link href="/committee" className="btn btn-secondary-slate" style={{ background: "transparent", color: "#ffffff", borderColor: "#334155" }}>
              পরিচালনা পর্ষদ দেখুন
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="landing-contact-section">
        <div className="landing-contact-inner">
          <h2 className="landing-section-title">যোগাযোগ</h2>
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
        <span className="landing-footer-developer">
          Developed by <strong>Code Caplet™</strong> · <a href="mailto:lab.codecaplet@gmail.com">lab.codecaplet@gmail.com</a>
        </span>
      </footer>
    </div>
  );
}
