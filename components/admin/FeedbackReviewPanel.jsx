"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Send } from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useAllFeedback, addFeedbackRemark } from "../../lib/feedback";

function timeAgo(ts) {
  const date = ts?.toDate?.();
  if (!date) return "just now";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function FeedbackReviewPanel() {
  const { user: adminUser } = useAuth();
  const { items, ready } = useAllFeedback();
  const [profiles, setProfiles] = useState({});
  const [filter, setFilter] = useState("open");
  const [remarkDraft, setRemarkDraft] = useState({});
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "profiles"), (snap) => {
      const map = {};
      snap.docs.forEach((d) => { map[d.id] = d.data(); });
      setProfiles(map);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((f) => f.status === filter)),
    [items, filter]
  );

  const openCount = items.filter((f) => f.status === "open").length;

  const handleRemark = async (item) => {
    const remark = (remarkDraft[item.id] || "").trim();
    if (!remark) return;
    setBusyId(item.id);
    try {
      await addFeedbackRemark({ feedbackItem: item, adminUid: adminUser.uid, remark });
      setRemarkDraft({ ...remarkDraft, [item.id]: "" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-panel-section">
      <h3>Member feedback</h3>
      <p className="step-sub">Remarks are sent back to the member as a notification.</p>

      <div className="pill-group" style={{ marginTop: 12, marginBottom: 16 }}>
        <button type="button" className={`pill ${filter === "open" ? "active" : ""}`} onClick={() => setFilter("open")}>
          Open{openCount > 0 ? ` (${openCount})` : ""}
        </button>
        <button type="button" className={`pill ${filter === "reviewed" ? "active" : ""}`} onClick={() => setFilter("reviewed")}>
          Reviewed
        </button>
        <button type="button" className={`pill ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All
        </button>
      </div>

      {!ready && <p className="helper-text">Loading feedback…</p>}
      {ready && filtered.length === 0 && <p className="helper-text">Nothing here.</p>}

      <div className="fund-review-list">
        {filtered.map((f) => {
          const author = profiles[f.uid];
          return (
            <div key={f.id} className="fund-review-card">
              <div className="fund-review-top">
                <div>
                  <div className="fund-review-donor">{author?.name || "(unknown member)"}</div>
                  <div className="fund-review-meta">{author?.email} · {timeAgo(f.createdAt)}</div>
                </div>
                <span className={`fund-status-badge ${f.status === "open" ? "fund-status-pending" : "fund-status-approved"}`}>
                  {f.status}
                </span>
              </div>

              <p className="notification-body" style={{ marginTop: 10 }}>{f.message}</p>

              {f.adminRemark && (
                <div className="fund-review-details">
                  <div><span className="fund-review-detail-label">Your remark</span>{f.adminRemark}</div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <input
                  type="text"
                  placeholder={f.status === "open" ? "Write a remark…" : "Update remark…"}
                  value={remarkDraft[f.id] || ""}
                  onChange={(e) => setRemarkDraft({ ...remarkDraft, [f.id]: e.target.value })}
                />
                <button
                  type="button"
                  className="btn"
                  style={{ width: "auto" }}
                  disabled={busyId === f.id || !(remarkDraft[f.id] || "").trim()}
                  onClick={() => handleRemark(f)}
                >
                  <Send size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />
                  Send
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
