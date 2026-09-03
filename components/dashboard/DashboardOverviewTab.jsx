"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import {
  Bell, FileText, Calendar, HeartHandshake, Users, Landmark,
  Wallet, Receipt, BookOpen, MapPin, ArrowRight, Download, X,
} from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../lib/notifications";
import { useVisibleMemos } from "../../lib/memos";
import { useVisibleEvents } from "../../lib/events";
import { useFundSettings, useMyContributions, useFundBalance } from "../../lib/fundContributions";

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return d;
  }
}

function fmtDateTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function SectionCard({ icon: Icon, title, seeAllHref, children }) {
  return (
    <div className="admin-panel-section dashboard-section-card">
      <div className="dashboard-section-header">
        <h3><Icon size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />{title}</h3>
        {seeAllHref && (
          <Link href={seeAllHref} className="link-button dashboard-section-seeall">
            সব দেখুন <ArrowRight size={13} style={{ verticalAlign: "-2px" }} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export default function DashboardOverviewTab() {
  const { user, userDoc } = useAuth();
  const isAdmin = userDoc?.role === "admin";

  const [profileData, setProfileData] = useState(null);
  const [memberCount, setMemberCount] = useState(null);

  const { notifications, unreadCount, ready: notifReady } = useNotifications(user?.uid);
  const { items: memos, ready: memosReady } = useVisibleMemos();
  const { items: events, ready: eventsReady } = useVisibleEvents();
  const { settings: fundSettings } = useFundSettings();
  const { items: myContributions } = useMyContributions(user?.uid);
  const { approvedTotal, expenseTotal, balance, ready: fundReady } = useFundBalance();

  const [constitutionOpen, setConstitutionOpen] = useState(false);

  // Fetch logged-in user's profile from 'profiles' collection safely
  useEffect(() => {
    if (!user?.uid) return;

    const unsubProfile = onSnapshot(
      doc(db, "profiles", user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }
      },
      (err) => console.warn("Profile fetch error:", err.message)
    );

    return () => unsubProfile();
  }, [user?.uid]);

  // Fetch total member count safely once user authentication is initialized
  useEffect(() => {
    if (!user?.uid) return;

    const unsub = onSnapshot(
      collection(db, "profiles"),
      (snap) => setMemberCount(snap.size),
      (err) => console.warn("Member count fetch error:", err.message)
    );

    return () => unsub();
  }, [user?.uid]);

  const upcomingEvents = events
    .filter((e) => !e.startAt || new Date(e.startAt) >= new Date())
    .slice(0, 3);
  const recentMemos = memos.slice(0, 3);
  const recentNotifications = notifications.slice(0, 4);
  const pendingContribution = myContributions.find((c) => c.status === "pending");

  const quickLinks = [
    { key: "directory", label: "ডিরেক্টরি", icon: Users },
    { key: "committee", label: "কমিটি", icon: Landmark },
    ...(isAdmin || fundSettings.visible ? [{ key: "contribute", label: "অনুদান", icon: HeartHandshake }] : []),
    { key: "memos", label: "স্মারক", icon: FileText },
    { key: "events", label: "ইভেন্ট", icon: Calendar },
    { key: "notifications", label: "নোটিফিকেশন", icon: Bell },
  ];

  return (
    <div className="dashboard-overview">
      <h1>ড্যাশবোর্ড</h1>
      <p className="step-sub">স্বাগতম, {profileData?.name || "সদস্য"}।</p>

      <div className="dashboard-quicklinks">
        {quickLinks.map((q) => (
          <Link key={q.key} href={`/dashboard?tab=${q.key}`} className="dashboard-quicklink">
            <q.icon size={18} />
            <span>{q.label}</span>
          </Link>
        ))}
      </div>

      <div className="dashboard-stat-cards">
        <div className="dashboard-stat-card">
          <Users size={18} />
          <div>
            <div className="dashboard-stat-value">{memberCount ?? "…"}</div>
            <div className="dashboard-stat-label">মোট সদস্য</div>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <Wallet size={18} />
          <div>
            <div className="dashboard-stat-value">৳{fundReady ? approvedTotal.toLocaleString() : "…"}</div>
            <div className="dashboard-stat-label">মোট তহবিল</div>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <Receipt size={18} />
          <div>
            <div className="dashboard-stat-value">৳{fundReady ? expenseTotal.toLocaleString() : "…"}</div>
            <div className="dashboard-stat-label">মোট ব্যয়</div>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <HeartHandshake size={18} />
          <div>
            <div className="dashboard-stat-value">৳{fundReady ? balance.toLocaleString() : "…"}</div>
            <div className="dashboard-stat-label">বর্তমান ব্যালেন্স</div>
          </div>
        </div>
      </div>

      {(isAdmin || fundSettings.visible) && (
        <div className="dashboard-alert-card">
          <HeartHandshake size={18} />
          {pendingContribution ? (
            <span>আপনার ৳{Number(pendingContribution.amount).toLocaleString()} অনুদান পর্যালোচনাধীন আছে।</span>
          ) : (
            <span>কল্যাণ তহবিলে অবদান রাখুন — বর্তমান ব্যালেন্স ৳{fundReady ? balance.toLocaleString() : "…"}।</span>
          )}
          <Link href="/dashboard?tab=contribute" className="btn-ghost btn" style={{ width: "auto", marginLeft: "auto" }}>
            দেখুন
          </Link>
        </div>
      )}

      <div className="dashboard-grid">
        <SectionCard icon={Bell} title={`সাম্প্রতিক নোটিফিকেশন${unreadCount > 0 ? ` (${unreadCount})` : ""}`} seeAllHref="/dashboard?tab=notifications">
          {!notifReady && <p className="helper-text">লোড হচ্ছে…</p>}
          {notifReady && recentNotifications.length === 0 && <p className="helper-text">কোনো নোটিফিকেশন নেই।</p>}
          <ul className="dashboard-mini-list">
            {recentNotifications.map((n) => (
              <li key={n.id} className={n.read ? "" : "dashboard-mini-unread"}>
                <span className="dashboard-mini-title">{n.title}</span>
                <span className="dashboard-mini-meta">{fmtDateTime(n.createdAt?.toDate?.())}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard icon={FileText} title="সাম্প্রতিক স্মারক" seeAllHref="/dashboard?tab=memos">
          {!memosReady && <p className="helper-text">লোড হচ্ছে…</p>}
          {memosReady && recentMemos.length === 0 && <p className="helper-text">কোনো স্মারক প্রকাশিত হয়নি।</p>}
          <ul className="dashboard-mini-list">
            {recentMemos.map((m) => (
              <li key={m.id}>
                <span className="dashboard-mini-title">{m.memoNo} — {m.title}</span>
                <span className="dashboard-mini-meta">{fmtDate(m.date)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard icon={Calendar} title="আসন্ন ইভেন্ট" seeAllHref="/dashboard?tab=events">
          {!eventsReady && <p className="helper-text">লোড হচ্ছে…</p>}
          {eventsReady && upcomingEvents.length === 0 && <p className="helper-text">কোনো আসন্ন ইভেন্ট নেই।</p>}
          <ul className="dashboard-mini-list">
            {upcomingEvents.map((e) => (
              <li key={e.id}>
                <span className="dashboard-mini-title">{e.title}</span>
                <span className="dashboard-mini-meta">
                  {fmtDateTime(e.startAt)}
                  {e.location && <> · <MapPin size={11} style={{ verticalAlign: "-1px" }} /> {e.location}</>}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="admin-panel-section dashboard-section-card">
          <div className="dashboard-section-header">
            <h3><BookOpen size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />গঠনতন্ত্র (Constitution)</h3>
          </div>
          <button type="button" className="btn btn-primary-blue" style={{ width: "auto" }} onClick={() => setConstitutionOpen(true)}>
            <FileText size={16} />
            গঠনতন্ত্র পড়ুন
          </button>
        </div>

        {constitutionOpen && (
          <div className="constitution-modal-overlay" onClick={() => setConstitutionOpen(false)}>
            <div className="constitution-modal" onClick={(e) => e.stopPropagation()}>
              <div className="constitution-modal-header">
                <h3>সংগঠনের গঠনতন্ত্র</h3>
                <button type="button" className="constitution-modal-close" onClick={() => setConstitutionOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="constitution-modal-body">
                <iframe
                  src="https://drive.google.com/file/d/1I6JF6EugtF3e7Y9-y7rGXXVsMTiM98Xn/preview"
                  title="তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ-এর গঠনতন্ত্র"
                  allow="autoplay"
                />
              </div>
              <div className="constitution-modal-footer">
                <a
                  className="btn btn-primary-blue"
                  href="https://drive.google.com/uc?export=download&id=1I6JF6EugtF3e7Y9-y7rGXXVsMTiM98Xn"
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download size={16} />
                  ডাউনলোড করুন
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}