"use client";

import Link from "next/link";
import Image from "next/image";
import { Landmark } from "lucide-react";
import { defaultAvatarFor } from "../../lib/photoUtils";
import { usePublicCommitteeMembers } from "../../lib/committee";

function avatarFor(profile) {
  return profile.photo?.useDefault === false && profile.photo?.base64
    ? profile.photo.base64
    : defaultAvatarFor(profile.gender);
}

export default function CommitteePage() {
  const { members, ready: membersReady } = usePublicCommitteeMembers();

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
          <Link href="/committee" className="landing-nav-link active">কমিটি</Link>
          <Link href="/notices" className="landing-nav-link">নোটিশ</Link>
          <Link href="/constitution" className="landing-nav-link">গঠনতন্ত্র</Link>
          <Link href="/#contact" className="landing-nav-link">যোগাযোগ</Link>
          <Link href="/login" className="landing-nav-link">লগ ইন</Link>
          <Link href="/register" className="btn landing-nav-cta">রেজিস্টার</Link>
        </div>
      </nav>

      <section className="landing-features" style={{ minHeight: "60vh" }}>
        <h2 className="landing-section-title">
          <Landmark size={22} style={{ verticalAlign: "-4px", marginRight: 8 }} />
          পরিচালনা পরিষদ
        </h2>
        {!membersReady && <p className="helper-text" style={{ textAlign: "center" }}>লোড হচ্ছে…</p>}
        {membersReady && members.length === 0 && (
          <p className="helper-text" style={{ textAlign: "center" }}>এখনও কোনো কমিটি সদস্য যুক্ত করা হয়নি।</p>
        )}
        <div className="directory-grid" style={{ marginTop: 24 }}>
          {members.map((m) => (
            <div key={m.id} className="directory-card">
              <div className="directory-card-top">
                <img src={avatarFor(m)} alt="" width={44} height={44} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                <div>
                  <div className="directory-card-name">{m.name}</div>
                  <span className="committee-role-badge">{m.committeeRole.title}</span>
                </div>
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