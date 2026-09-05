"use client";

import { useState } from "react";
import {
  FolderArchive,
  Download,
  FileText,
  Search,
  Sparkles,
  Clock,
  ShieldCheck,
  Award,
  BookOpen,
  Layers,
  Info,
  Scale,
  Building2,
  FileCheck,
} from "lucide-react";

// Categorization specifically tailored for professional Pharmacists in Bangladesh
const ARCHIVE_CATEGORIES = [
  { key: "all", label: "সকল ফাইল" },
  { key: "grade10", label: "১০ম গ্রেড সংক্রান্ত নথি" },
  { key: "circulars", label: "নিয়োগ ও অফিসিয়াল সার্কুলার" },
  { key: "memoranda", label: "স্মারকপত্র ও প্রজ্ঞাপন (Memoranda)" },
  { key: "regulatory", label: "ফার্মেসী কাউন্সিল ও ডিজিডিএ" },
  { key: "forms", label: "আবেদনপত্র ও সাংগঠনিক ফরম" },
];

const PHARMACIST_ARCHIVE_FILES = [
  {
    id: "g10-1",
    title: "১০ম গ্রেড বেতন স্কেল বাস্তবায়ন সংক্রান্ত স্বাস্থ্য ও পরিবার কল্যাণ মন্ত্রণালয়ের সরকারি প্রজ্ঞাপন",
    category: "grade10",
    categoryLabel: "১০ম গ্রেড সংক্রান্ত নথি",
    format: "PDF",
    size: "১.৮ মেগাবাইট",
    updatedAt: "২০২৬",
    description: "ডিপ্লোমা ফার্মাসিস্টদের ১০ম গ্রেড পদমর্যাদা ও বেতন স্কেল বাস্তবায়ন সম্পর্কিত স্বাস্থ্য সেবা বিভাগ ও অর্থ বিভাগের সমন্বিত প্রজ্ঞাপন ও আদেশ।",
    tags: ["১০ম গ্রেড", "স্বাস্থ্য মন্ত্রণালয়", "অর্থ বিভাগ"],
  },
  {
    id: "g10-2",
    title: "ফার্মাসিস্ট ১০ম গ্রেড পদমর্যাদা ও বেতন স্কেল সংক্রান্ত মহামান্য হাইকোর্টের রিট পিটিশন আদেশ ও রায়",
    category: "grade10",
    categoryLabel: "১০ম গ্রেড সংক্রান্ত নথি",
    format: "PDF",
    size: "৩.২ মেগাবাইট",
    updatedAt: "২০২৬",
    description: "ডিপ্লোমা ফার্মাসিস্টদের ১০ম গ্রেড প্রাপ্তি ও সমঅধিকার নিশ্চিতকরণে মহামান্য হাইকোর্ট ও সুপ্রিম কোর্টের ঐতিহাসিক রায় ও দিকনির্দেশনা।",
    tags: ["১০ম গ্রেড", "আদালতের রায়", "আইনি দলিল"],
  },
  {
    id: "circ-1",
    title: "স্বাস্থ্য অধিদপ্তর (DGHS) ফার্মাসিস্ট (১০ম গ্রেড) সরাসরি নিয়োগ সার্কুলার ও পূর্ণাঙ্গ পরীক্ষার সিলেবাস",
    category: "circulars",
    categoryLabel: "নিয়োগ ও অফিসিয়াল সার্কুলার",
    format: "PDF",
    size: "১.৪ মেগাবাইট",
    updatedAt: "২০২৬",
    description: "স্বাস্থ্য অধিদপ্তরের আওতাধীন সরকারি হাসপাতাল ও স্বাস্থ্য কমপ্লেক্সে ফার্মাসিস্ট নিয়োগ বিজ্ঞপ্তি, শিক্ষাগত যোগ্যতা ও লিখিত পরীক্ষার নির্দেশিকা।",
    tags: ["নিয়োগ সার্কুলার", "ডিজিএইচএস", "১০ম গ্রেড"],
  },
  {
    id: "circ-2",
    title: "পরিবার পরিকল্পনা অধিদপ্তর (DGFP) ফার্মাসিস্ট নিয়োগ সার্কুলার ও আবেদন নির্দেশিকা",
    category: "circulars",
    categoryLabel: "নিয়োগ ও অফিসিয়াল সার্কুলার",
    format: "PDF",
    size: "১.১ মেগাবাইট",
    updatedAt: "২০২৬",
    description: "পরিবার পরিকল্পনা অধিদপ্তরের বিভিন্ন ইউনিট ও মা ও শিশু কল্যাণ কেন্দ্রে ফার্মাসিস্ট পদে সরাসরি নিয়োগ বিজ্ঞপ্তি ও অনলাইন আবেদন সহায়িকা।",
    tags: ["নিয়োগ সার্কুলার", "ডিজিএফপি"],
  },
  {
    id: "memo-1",
    title: "ডিপ্লোমা ফার্মাসিস্টদের পদবী ও কর্মপরিধি নির্ধারণ সংক্রান্ত আন্তঃমন্ত্রণালয় কমিটির অফিস স্মারক (Memorandum)",
    category: "memoranda",
    categoryLabel: "স্মারকপত্র ও প্রজ্ঞাপন (Memoranda)",
    format: "PDF",
    size: "২.১ মেগাবাইট",
    updatedAt: "২০২৬",
    description: "স্বাস্থ্যসেবা ব্যবস্থায় ফার্মাসিস্টদের পদবী সংস্কার ও সুনির্দিষ্ট দায়িত্ব বণ্টন বিষয়ে গঠিত আন্তঃমন্ত্রণালয় কমিটির মূল অফিস স্মারক ও সুপারিশপত্র।",
    tags: ["স্মারকপত্র", "Memorandum", "আন্তঃমন্ত্রণালয়"],
  },
  {
    id: "memo-2",
    title: "হাসপাতাল ফার্মাসিস্টদের কর্মঘণ্টা, পদোন্নতি ও জ্যেষ্ঠতা নির্ধারণ সংক্রান্ত স্বাস্থ্য সেবা বিভাগের প্রজ্ঞাপন",
    category: "memoranda",
    categoryLabel: "স্মারকপত্র ও প্রজ্ঞাপন (Memoranda)",
    format: "PDF",
    size: "১.৫ মেগাবাইট",
    updatedAt: "২০২৬",
    description: "হাসপাতাল ও বিশেষায়িত স্বাস্থ্য প্রতিষ্ঠানে কর্মরত ফার্মাসিস্টদের পদোন্নতির যোগ্যতা ও চাকরির ধারাবাহিকতা রক্ষার সরকারি স্মারক।",
    tags: ["স্মারকপত্র", "পদোন্নতি বিধিমালা"],
  },
  {
    id: "reg-1",
    title: "বাংলাদেশ ফার্মেসী কাউন্সিল (PCB) প্রফেশনাল রেজিস্ট্রেশন সনদ গ্রহণ ও নবায়ন নির্দেশিকা",
    category: "regulatory",
    categoryLabel: "ফার্মেসী কাউন্সিল ও ডিজিডিএ",
    format: "PDF",
    size: "৮৫০ কিলোবাইট",
    updatedAt: "২০২৬",
    description: "ডিপ্লোমা ইন ফার্মেসি সম্পন্নকারীদের কাউন্সিল সনদ নিবন্ধন, লাইসেন্স নবায়ন এবং ফি জমা সংক্রান্ত প্রাতিষ্ঠানিক নির্দেশিকা ও ফরম।",
    tags: ["ফার্মেসী কাউন্সিল", "রেজিস্ট্রেশন", "পেশাগত সনদ"],
  },
  {
    id: "reg-2",
    title: "ওষুধ প্রশাসন অধিদপ্তর (DGDA) হাসপাতাল ফার্মেসি পরিচালনা ও ড্রাগ মনিটরিং জাতীয় গাইডলাইন",
    category: "regulatory",
    categoryLabel: "ফার্মেসী কাউন্সিল ও ডিজিডিএ",
    format: "PDF",
    size: "৪.২ মেগাবাইট",
    updatedAt: "২০২৬",
    description: "হাসপাতালে ওষুধের নিরাপদ সংরক্ষণ, অ্যান্টিবায়োটিক ব্যবহার মনিটরিং এবং কোল্ড-চেইন ব্যবস্থাপনায় ফার্মাসিস্টদের পালনীয় জাতীয় নীতিমালা।",
    tags: ["ডিজিডিএ", "হাসপাতাল ফার্মেসি", "ওষুধ প্রশাসন"],
  },
  {
    id: "form-1",
    title: "তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ — সদস্যপদ আবেদন ও তথ্য হালনাগাদ ফরম",
    category: "forms",
    categoryLabel: "আবেদনপত্র ও সাংগঠনিক ফরম",
    format: "PDF",
    size: "৬২০ কিলোবাইট",
    updatedAt: "২০২৬",
    description: "সংগঠনের সাধারণ ও আজীবন সদস্যপদ গ্রহণ, জেলাভিত্তিক কমিটি অন্তর্ভুক্তি এবং তথ্য হালনাগাদের জন্য অফিশিয়াল ফরম।",
    tags: ["সদস্য ফরম", "সাংগঠনিক"],
  },
  {
    id: "form-2",
    title: "ফার্মাসিস্ট পেশাগত অধিকার ও আইনি সহায়তা তহবিল আবেদন ফরম",
    category: "forms",
    categoryLabel: "আবেদনপত্র ও সাংগঠনিক ফরম",
    format: "PDF",
    size: "৫৪০ কিলোবাইট",
    updatedAt: "২০২৬",
    description: "চাকরি সংক্রান্ত জটিলতা, প্রশাসনিক অবিচার বা আইনি সহায়তার প্রয়োজনে সংগঠনের কেন্দ্রীয় সেলে আবেদনের নির্ধারিত ফরম।",
    tags: ["আইনি সহায়তা", "কল্যাণ তহবিল"],
  },
];

export default function ArchiveTab() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = PHARMACIST_ARCHIVE_FILES.filter((file) => {
    const matchesCategory = selectedCategory === "all" || file.category === selectedCategory;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      file.title.toLowerCase().includes(q) ||
      file.description.toLowerCase().includes(q) ||
      file.categoryLabel.toLowerCase().includes(q) ||
      (file.tags && file.tags.some((t) => t.toLowerCase().includes(q)));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="archive-tab-shell animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
              color: "#1d4ed8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.1)",
            }}
          >
            <FolderArchive size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "var(--forest, #0f172a)", letterSpacing: "-0.3px" }}>
              ফার্মাসিস্ট গুরুত্বপূর্ণ ফাইল ও ডকুমেন্ট আর্কাইভ
            </h1>
            <p className="step-sub" style={{ margin: 0, marginTop: 2, fontSize: 13.5 }}>
              ১০ম গ্রেড সংক্রান্ত গেজেট ও প্রজ্ঞাপন, সরকারি নিয়োগ সার্কুলার, স্মারকপত্র (Memoranda) ও নীতিমালার কেন্দ্রীয় সংগ্রহশালা।
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Coming Soon Banner with Specific Pharmacist Focus */}
      <div
        className="archive-coming-soon-banner"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d9488 100%)",
          color: "#ffffff",
          borderRadius: 16,
          padding: "24px 28px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 12px 28px -6px rgba(15, 23, 42, 0.2)",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -24,
            right: -24,
            width: 160,
            height: 160,
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(255,255,255,0) 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#38bdf8",
              flexShrink: 0,
            }}
          >
            <Clock size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <span
                style={{
                  background: "#f59e0b",
                  color: "#000000",
                  fontWeight: 800,
                  fontSize: 12,
                  padding: "3px 11px",
                  borderRadius: 20,
                  letterSpacing: "0.2px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Sparkles size={13} />
                শীঘ্রই আসছে • Coming Soon
              </span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>
                নথি যাচাইকরণ ও ডাটাবেজ প্রস্তুতকরণ চলছে
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px 0", color: "#f8fafc" }}>
              ডিপ্লোমা ফার্মাসিস্টদের অধিকার ও পেশাগত নথির ডিজিটাল আর্কাইভ
            </h2>
            <p style={{ margin: "0 0 12px 0", fontSize: 13.5, color: "#cbd5e1", lineHeight: 1.6, maxWidth: 780 }}>
              এখানে ফার্মাসিস্টদের বহুল প্রতীক্ষিত <strong>১০ম গ্রেড পদমর্যাদা ও বেতন স্কেল সংক্রান্ত সরকারি গেজেট ও প্রজ্ঞাপন</strong>,
              আদালতের ঐতিহাসিক রায় ও রিট আদেশ, স্বাস্থ্য অধিদপ্তর ও পরিবার পরিকল্পনা অধিদপ্তরের <strong>নিয়োগ সার্কুলার</strong>,
              মন্ত্রণালয়ের <strong>অফিস স্মারকপত্র (Memoranda)</strong> এবং ফার্মেসী কাউন্সিলের সকল গুরুত্বপূর্ণ ফাইল এক ছাদের নিচে সংরক্ষিত থাকবে।
            </p>

            {/* Feature Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, background: "rgba(255,255,255,0.14)", padding: "3px 10px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Scale size={13} style={{ color: "#38bdf8" }} /> ১০ম গ্রেড গেজেট ও রিট
              </span>
              <span style={{ fontSize: 12, background: "rgba(255,255,255,0.14)", padding: "3px 10px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <FileText size={13} style={{ color: "#38bdf8" }} /> সরকারি নিয়োগ সার্কুলার
              </span>
              <span style={{ fontSize: 12, background: "rgba(255,255,255,0.14)", padding: "3px 10px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Building2 size={13} style={{ color: "#38bdf8" }} /> মন্ত্রণালয় স্মারক (Memoranda)
              </span>
              <span style={{ fontSize: 12, background: "rgba(255,255,255,0.14)", padding: "3px 10px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Download size={13} style={{ color: "#38bdf8" }} /> ১-ক্লিকে ফ্রি ডাউনলোড
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {ARCHIVE_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: selectedCategory === cat.key ? 700 : 500,
                border: "1.5px solid",
                borderColor: selectedCategory === cat.key ? "var(--coral, #2563eb)" : "var(--border, #e2e8f0)",
                background: selectedCategory === cat.key ? "#eff6ff" : "var(--white, #ffffff)",
                color: selectedCategory === cat.key ? "#1d4ed8" : "#475569",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: 260, flex: "1 1 260px", maxWidth: 380 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            type="text"
            placeholder="১০ম গ্রেড, সার্কুলার বা স্মারক দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              height: 38,
              paddingLeft: 36,
              paddingRight: 12,
              borderRadius: 8,
              border: "1px solid var(--border, #cbd5e1)",
              fontSize: 13,
              background: "#ffffff",
            }}
          />
        </div>
      </div>

      {/* File Archive List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            style={{
              background: "#ffffff",
              border: "1px solid var(--border, #e2e8f0)",
              borderRadius: 12,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              transition: "all 0.18s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "#fef2f2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 11,
                  letterSpacing: "0.5px",
                  flexShrink: 0,
                  border: "1px solid #fee2e2",
                }}
              >
                {file.format}
              </div>
              <div>
                <h3
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0f172a",
                    lineHeight: 1.35,
                  }}
                >
                  {file.title}
                </h3>
                <p style={{ margin: "0 0 6px 0", fontSize: 12.5, color: "#64748b", lineHeight: 1.45 }}>
                  {file.description}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "#94a3b8", flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: "#f1f5f9",
                      color: "#334155",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontWeight: 600,
                    }}
                  >
                    {file.categoryLabel}
                  </span>
                  <span>আকার: {file.size}</span>
                  <span>•</span>
                  <span>নথি বছর: {file.updatedAt}</span>
                  {file.tags && file.tags.length > 0 && (
                    <>
                      <span>•</span>
                      {file.tags.map((tag) => (
                        <span key={tag} style={{ background: "#eff6ff", color: "#2563eb", padding: "1px 6px", borderRadius: 4 }}>
                          #{tag}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <button
                type="button"
                className="btn"
                disabled
                style={{
                  padding: "8px 14px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#f1f5f9",
                  color: "#94a3b8",
                  border: "1px solid #e2e8f0",
                  cursor: "not-allowed",
                  borderRadius: 8,
                }}
                title="ফাইল আপলোড ও ডাটাবেজ লিংক সম্পন্ন হলে শীঘ্রই ডাউনলোড সক্রিয় হবে"
              >
                <Download size={14} />
                ডাউনলোড (শীঘ্রই)
              </button>
            </div>
          </div>
        ))}

        {filteredFiles.length === 0 && (
          <div
            style={{
              padding: 36,
              textAlign: "center",
              background: "#ffffff",
              borderRadius: 12,
              border: "1px dashed #cbd5e1",
              color: "#64748b",
            }}
          >
            কোনো নথি পাওয়া যায়নি। অন্য কিওয়ার্ড বা ক্যাটাগরি দিয়ে খুঁজুন।
          </div>
        )}
      </div>

      {/* Official Help Notice */}
      <div
        style={{
          marginTop: 24,
          padding: "14px 18px",
          borderRadius: 10,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12.5,
          color: "#64748b",
        }}
      >
        <Info size={16} style={{ color: "#0284c7", flexShrink: 0 }} />
        <span>
          ১০ম গ্রেড বাস্তবায়ন সংক্রান্ত যেকোনো নতুন গেজেট, আদালতের রিট আদেশ বা অফিসিয়াল স্মারক যুক্ত করার পরামর্শ দিতে কেন্দ্রীয় কার্যনির্বাহী পরিষদের সাথে যোগাযোগ করুন।
        </span>
      </div>
    </div>
  );
}
