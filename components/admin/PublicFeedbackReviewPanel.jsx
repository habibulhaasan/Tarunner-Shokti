"use client";

import { useMemo, useState } from "react";
import { Phone, Mail, MapPin, Search, Trash2, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAllPublicFeedback, updatePublicFeedbackStatus, deletePublicFeedback } from "../../lib/feedback";

function timeAgo(ts) {
  const date = ts?.toDate?.();
  if (!date) return "just now";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function PublicFeedbackReviewPanel() {
  const { user: adminUser } = useAuth();
  const { items, ready } = useAllPublicFeedback();
  const [filter, setFilter] = useState("open"); // "open" | "reviewed" | "all"
  const [search, setSearch] = useState("");
  const [noteDraft, setNoteDraft] = useState({});
  const [busyId, setBusyId] = useState(null);

  const openCount = items.filter((f) => f.status === "open").length;

  const filtered = useMemo(() => {
    let result = filter === "all" ? items : items.filter((f) => f.status === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          f.mobile?.toLowerCase().includes(q) ||
          f.email?.toLowerCase().includes(q) ||
          f.address?.toLowerCase().includes(q) ||
          f.message?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, filter, search]);

  const handleUpdateStatus = async (item, newStatus) => {
    setBusyId(item.id);
    try {
      const currentNote = noteDraft[item.id] !== undefined ? noteDraft[item.id] : (item.adminNote || "");
      await updatePublicFeedbackStatus({
        feedbackId: item.id,
        status: newStatus,
        adminNote: currentNote,
        adminUid: adminUser?.uid || null,
      });
      setNoteDraft((prev) => ({ ...prev, [item.id]: "" }));
    } catch (err) {
      console.error("Error updating public feedback status:", err);
      alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`আপনি কি "${item.name}"-এর ফিডব্যাক মুছে ফেলতে চান?`)) return;
    setBusyId(item.id);
    try {
      await deletePublicFeedback(item.id);
    } catch (err) {
      console.error("Error deleting public feedback:", err);
      alert("ফিডব্যাক মুছতে সমস্যা হয়েছে।");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-panel-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>Public Feedback</h3>
          <p className="step-sub" style={{ margin: "4px 0 0" }}>
            Feedback and inquiries submitted by visitors from the website landing page.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginTop: 14, marginBottom: 16 }}>
        <div className="pill-group">
          <button
            type="button"
            className={`pill ${filter === "open" ? "active" : ""}`}
            onClick={() => setFilter("open")}
          >
            Open{openCount > 0 ? ` (${openCount})` : ""}
          </button>
          <button
            type="button"
            className={`pill ${filter === "reviewed" ? "active" : ""}`}
            onClick={() => setFilter("reviewed")}
          >
            Reviewed
          </button>
          <button
            type="button"
            className={`pill ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({items.length})
          </button>
        </div>

        <div style={{ position: "relative", minWidth: 260 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search name, phone, email, text…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "6px 10px 6px 32px",
              fontSize: 13,
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              width: "100%",
              outline: "none",
            }}
          />
        </div>
      </div>

      {!ready && <p className="helper-text">Loading public feedback…</p>}
      {ready && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 16px", background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
          <MessageSquare size={28} style={{ color: "#94a3b8", marginBottom: 8 }} />
          <p className="helper-text" style={{ margin: 0 }}>
            {search ? "No matching public feedback found." : "No public feedback submissions found."}
          </p>
        </div>
      )}

      <div className="fund-review-list">
        {filtered.map((item) => {
          const isBusy = busyId === item.id;
          const currentDraft = noteDraft[item.id] !== undefined ? noteDraft[item.id] : (item.adminNote || "");

          return (
            <div key={item.id} className="fund-review-card" style={{ borderLeft: item.status === "open" ? "4px solid #2563eb" : "4px solid #16a34a" }}>
              <div className="fund-review-top">
                <div>
                  <div className="fund-review-donor" style={{ fontSize: 16 }}>{item.name}</div>
                  <div className="fund-review-meta" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <Clock size={12} /> {timeAgo(item.createdAt)}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={`fund-status-badge ${item.status === "open" ? "fund-status-pending" : "fund-status-approved"}`}>
                    {item.status === "open" ? "Open" : "Reviewed"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={isBusy}
                    title="Delete feedback"
                    style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4, display: "inline-flex" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Submitter Details Bar */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 14,
                  background: "#f1f5f9",
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  marginTop: 10,
                }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#1e293b" }}>
                  <Phone size={13} style={{ color: "#2563eb" }} />
                  <a href={`tel:${item.mobile}`} style={{ color: "inherit", fontWeight: 600, textDecoration: "none" }}>
                    {item.mobile}
                  </a>
                </div>

                {item.email && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#1e293b" }}>
                    <Mail size={13} style={{ color: "#2563eb" }} />
                    <a href={`mailto:${item.email}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {item.email}
                    </a>
                  </div>
                )}

                {item.address && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#475569" }}>
                    <MapPin size={13} style={{ color: "#2563eb" }} />
                    <span>{item.address}</span>
                  </div>
                )}
              </div>

              {/* Feedback Message */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginTop: 10,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "#0f172a",
                  whiteSpace: "pre-wrap",
                }}
              >
                {item.message}
              </div>

              {/* Admin Note / Status Update */}
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                {item.status === "reviewed" && item.adminNote && (
                  <div style={{ fontSize: 12.5, color: "#15803d", marginBottom: 8, background: "#f0fdf4", padding: "6px 10px", borderRadius: 6, border: "1px solid #bbf7d0" }}>
                    <strong>Admin Note:</strong> {item.adminNote}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    placeholder="Add an internal admin note…"
                    value={currentDraft}
                    onChange={(e) => setNoteDraft({ ...noteDraft, [item.id]: e.target.value })}
                    style={{
                      flex: 1,
                      minWidth: 200,
                      padding: "6px 12px",
                      fontSize: 13,
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                    }}
                  />
                  {item.status === "open" ? (
                    <button
                      type="button"
                      className="btn btn-secondary-slate"
                      style={{ padding: "6px 12px", fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 4 }}
                      onClick={() => handleUpdateStatus(item, "reviewed")}
                      disabled={isBusy}
                    >
                      <CheckCircle2 size={14} /> Mark as Reviewed
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: "6px 10px", fontSize: 12.5 }}
                        onClick={() => handleUpdateStatus(item, "open")}
                        disabled={isBusy}
                      >
                        Re-open
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary-slate"
                        style={{ padding: "6px 12px", fontSize: 12.5 }}
                        onClick={() => handleUpdateStatus(item, "reviewed")}
                        disabled={isBusy}
                      >
                        Save Note
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

