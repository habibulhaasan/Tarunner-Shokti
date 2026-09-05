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
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc" }}>ফার্মাসিস্ট আর্কাইভ</h1>
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

          </div>
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
