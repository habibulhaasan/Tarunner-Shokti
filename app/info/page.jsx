"use client";

import Link from "next/link";
import Image from "next/image";
import { FileText, Landmark } from "lucide-react";
import { defaultAvatarFor } from "../../lib/photoUtils";
import { usePublicCommitteeMembers } from "../../lib/committee";
import { useVisibleMemos } from "../../lib/memos";

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return d;
  }
}

function avatarFor(profile) {
  return profile.photo?.useDefault === false && profile.photo?.base64
    ? profile.photo.base64
    : defaultAvatarFor(profile.gender);
}

export default function PublicInfoPage() {
  const { members, ready: membersReady } = usePublicCommitteeMembers();
  const { items: memos, ready: memosReady } = useVisibleMemos();

  return (
    <div className="landing-shell">
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="landing-nav-logo-wrap">
            <Image src="/logo.png" alt="তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ" fill className="landing-nav-logo" />
          </div>
          তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ
        </div>
        <div className="landing-nav-actions">
          <Link href="/" className="landing-nav-link">হোম</Link>
          <Link href="/login" className="landing-nav-link">লগ ইন</Link>
          <Link href="/register" className="btn landing-nav-cta">রেজিস্টার করুন</Link>
        </div>
      </nav>

      <section className="landing-features">
        <h2 className="landing-section-title"><Landmark size={20} style={{ verticalAlign: "-4px", marginRight: 8 }} />পরিচালনা পরিষদ</h2>
        {!membersReady && <p className="helper-text">লোড হচ্ছে…</p>}
        {membersReady && members.length === 0 && <p className="helper-text">এখনও কোনো কমিটি সদস্য যুক্ত করা হয়নি।</p>}
        <div className="directory-grid" style={{ marginTop: 18 }}>
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

      <section className="landing-features">
        <h2 className="landing-section-title"><FileText size={20} style={{ verticalAlign: "-4px", marginRight: 8 }} />প্রকাশিত স্মারক ও নোটিশ</h2>
        {!memosReady && <p className="helper-text">লোড হচ্ছে…</p>}
        {memosReady && memos.length === 0 && <p className="helper-text">এখনও কোনো স্মারক প্রকাশ করা হয়নি।</p>}
        <div className="fund-review-list" style={{ marginTop: 18, maxWidth: 800, marginLeft: "auto", marginRight: "auto" }}>
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
      </footer>
    </div>
  );
}
