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
          <div className="landing-nav-logo-wrap">
            <Image src="/logo.png" alt="তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ" fill className="landing-nav-logo" sizes="32px" />
          </div>
          তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ
        </div>
        <div className="landing-nav-actions">
          <Link href="/" className="landing-nav-link">হোম</Link>
          <Link href="/notices" className="landing-nav-link">নোটিশ</Link>
          <Link href="/login" className="landing-nav-link">লগ ইন</Link>
          <Link href="/register" className="btn landing-nav-cta">রেজিস্টার করুন</Link>
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
      </footer>
    </div>
  );
}