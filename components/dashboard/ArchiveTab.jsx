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
  FileSpreadsheet,
  Layers,
  Info,
  CheckCircle2,
} from "lucide-react";

// Preview / initial structure for future document archive data
const ARCHIVE_CATEGORIES = [
  { key: "all", label: "সকল ফাইল" },
  { key: "constitution", label: "গঠনতন্ত্র ও নীতিমালা" },
  { key: "forms", label: "ফরম ও আবেদনপত্র" },
  { key: "reports", label: "প্রতিবেদন ও প্রকাশনা" },
  { key: "memos", label: "স্মারক ও সার্কুলার" },
];

const PREVIEW_FILES = [
  {
    id: "f1",
    title: "তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ — পূর্ণাঙ্গ গঠনতন্ত্র ও কার্যপ্রণালী বিধিমালা",
    category: "constitution",
    categoryLabel: "গঠনতন্ত্র ও নীতিমালা",
    format: "PDF",
    size: "২.৪ মেগাবাইট",
    updatedAt: "২০২৬",
    description: "সংগঠনের লক্ষ্য, উদ্দেশ্য, সাংগঠনিক কাঠামো ও সদস্য অধিকার সংক্রান্ত পূর্ণাঙ্গ দলিল।",
  },
  {
    id: "f2",
    title: "সাধারণ সদস্যপদ আবেদন ও হালনাগাদ ফরম",
    category: "forms",
    categoryLabel: "ফরম ও আবেদনপত্র",
    format: "PDF",
    size: "৮৫০ কিলোবাইট",
    updatedAt: "২০২৬",
    description: "নতুন সদস্য নিবন্ধনের অফলাইন ফরম ও প্রয়োজনীয় নথির তালিকা।",
  },
  {
    id: "f3",
    title: "সদস্য কল্যাণ তহবিল ও চিকিৎসা সহায়তা নির্দেশিকা",
    category: "constitution",
    categoryLabel: "গঠনতন্ত্র ও নীতিমালা",
    format: "PDF",
    size: "১.২ মেগাবাইট",
    updatedAt: "২০২৬",
    description: "জরুরি চিকিৎসা ও সদস্যদের আপদকালীন সহায়তার জন্য নির্ধারিত নীতিমালা।",
  },
  {
    id: "f4",
    title: "স্বেচ্ছায় রক্তদান ক্যাম্পেইন পরিচালনা গাইডলাইন ও ফরম",
    category: "forms",
    categoryLabel: "ফরম ও আবেদনপত্র",
    format: "PDF",
    size: "৯৫৪ কিলোবাইট",
    updatedAt: "২০২৬",
    description: "জেলা ও বিভাগীয় পর্যায়ে রক্তদান কর্মসূচি আয়োজনের অফিসিয়াল গাইডলাইন।",
  },
  {
    id: "f5",
    title: "বার্ষিক সাংগঠনিক প্রতিবেদন ও অডিট রিপোর্ট (সারাংশ)",
    category: "reports",
    categoryLabel: "প্রতিবেদন ও প্রকাশনা",
    format: "PDF",
    size: "৩.১ মেগাবাইট",
    updatedAt: "২০২৫-২৬",
    description: "সংগঠনের সামগ্রিক কার্যক্রম, আর্থিক বিবরণী ও সামাজিক উদ্যোগের বার্ষিক সংকলন।",
  },
];

export default function ArchiveTab() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = PREVIEW_FILES.filter((file) => {
    const matchesCategory = selectedCategory === "all" || file.category === selectedCategory;
    const matchesSearch =
      !searchTerm.trim() ||
      file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="archive-tab-shell animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FolderArchive size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--forest, #0f172a)" }}>
              ফাইল ও ডকুমেন্ট আর্কাইভ
            </h1>
            <p className="step-sub" style={{ margin: 0, marginTop: 2, fontSize: 13.5 }}>
              সংগঠনের সকল প্রাতিষ্ঠানিক নথি, ফরম, নীতিমালা ও প্রকাশনার কেন্দ্রীয় সংগ্রহশালা।
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Coming Soon Banner */}
      <div
        className="archive-coming-soon-banner"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f766e 100%)",
          color: "#ffffff",
          borderRadius: 16,
          padding: "24px 28px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.15)",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 140,
            height: 140,
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(255,255,255,0) 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: 48,
              height: 48,
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
            <Clock size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <span
                style={{
                  background: "#f59e0b",
                  color: "#000000",
                  fontWeight: 800,
                  fontSize: 12,
                  padding: "3px 10px",
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
                ডকুমেন্ট আর্কাইভ প্রস্তুতকরণ চলছে
              </span>
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 6px 0", color: "#f8fafc" }}>
              প্রাতিষ্ঠানিক নথি ও ডাউনলোড সেন্টার
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, color: "#cbd5e1", lineHeight: 1.55, maxWidth: 720 }}>
              এই সেকশনটিতে সংগঠনের অনুমোদিত গঠনতন্ত্র, প্রকাশনা, সদস্য ফরম এবং নোটিশসমূহ আপলোড করা হচ্ছে।
              শীঘ্রই সকল সদস্য ও শুভানুধ্যায়ী এখান থেকে সরাসরি সকল প্রয়োজনীয় ফাইল ব্রাউজ ও ১-ক্লিকে ডাউনলোড করতে পারবেন।
            </p>
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
                border: "1px solid",
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

        <div style={{ position: "relative", minWidth: 240, flex: "1 1 240px", maxWidth: 360 }}>
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
            placeholder="ফাইলের নাম বা বিষয় দিয়ে খুঁজুন..."
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
                <p style={{ margin: "0 0 6px 0", fontSize: 12.5, color: "#64748b", lineHeight: 1.4 }}>
                  {file.description}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11.5, color: "#94a3b8" }}>
                  <span
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontWeight: 600,
                    }}
                  >
                    {file.categoryLabel}
                  </span>
                  <span>আকার: {file.size}</span>
                  <span>•</span>
                  <span>সংস্করণ: {file.updatedAt}</span>
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
                title="ফাইল আপলোড সম্পন্ন হলে শীঘ্রই ডাউনলোড করা যাবে"
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
              padding: 32,
              textAlign: "center",
              background: "#ffffff",
              borderRadius: 12,
              border: "1px dashed #cbd5e1",
              color: "#64748b",
            }}
          >
            কোনো ফাইল পাওয়া যায়নি। অন্য কিওয়ার্ড দিয়ে চেষ্টা করুন।
          </div>
        )}
      </div>

      {/* Future Information Note */}
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
        <Info size={16} style={{ color: "#3b82f6", flexShrink: 0 }} />
        <span>
          প্রশাসনিক বা প্রাতিষ্ঠানিক কোনো নির্দিষ্ট নথির জরুরি প্রয়োজনে কেন্দ্রীয় কার্যনির্বাহী পরিষদের সাথে যোগাযোগ করুন।
        </span>
      </div>
    </div>
  );
}

