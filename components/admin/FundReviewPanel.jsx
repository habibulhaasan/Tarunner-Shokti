"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Check, X } from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useAllContributions, useFundBalance, approveContribution, rejectContribution } from "../../lib/fundContributions";

const FILTERS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

function timeAgo(ts) {
  const date = ts?.toDate?.();
  if (!date) return "just now";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function FundReviewPanel() {
  const { user: adminUser } = useAuth();
  const { items, ready } = useAllContributions();
  const { approvedTotal } = useFundBalance();
  const [profiles, setProfiles] = useState({});
  const [filter, setFilter] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [noteDraft, setNoteDraft] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "profiles"), (snap) => {
      const map = {};
      snap.docs.forEach((d) => { map[d.id] = d.data(); });
      setProfiles(map);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((c) => c.status === filter)),
    [items, filter]
  );

  const pendingCount = items.filter((c) => c.status === "pending").length;

  const handleApprove = async (c) => {
    setBusyId(c.id);
    try {
      await approveContribution({ contribution: c, adminUid: adminUser.uid, adminNote: noteDraft[c.id] || "" });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (c) => {
    setBusyId(c.id);
    try {
      await rejectContribution({ contribution: c, adminUid: adminUser.uid, adminNote: noteDraft[c.id] || "" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-panel-section">
      <div className="fund-balance-banner">
        <div>
          <div className="fund-balance-label">Confirmed fund balance</div>
          <div className="fund-balance-amount">৳{approvedTotal.toLocaleString()}</div>
        </div>
        {pendingCount > 0 && <span className="stat-pill">{pendingCount} awaiting review</span>}
      </div>

      <div className="pill-group" style={{ marginTop: 18, marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button key={f.key} type="button" className={`pill ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {!ready && <p className="helper-text">Loading submissions…</p>}
      {ready && filtered.length === 0 && <p className="helper-text">Nothing here.</p>}

      <div className="fund-review-list">
        {filtered.map((c) => {
          const donor = profiles[c.uid];
          return (
            <div key={c.id} className="fund-review-card">
              <div className="fund-review-top">
                <div>
                  <div className="fund-review-donor">{donor?.name || "(unknown member)"}</div>
                  <div className="fund-review-meta">{donor?.email} · {timeAgo(c.createdAt)}</div>
                </div>
                <span className={`fund-status-badge fund-status-${c.status}`}>{c.status}</span>
              </div>

              <div className="fund-review-details">
                <div><span className="fund-review-detail-label">Amount</span>৳{Number(c.amount).toLocaleString()}</div>
                <div><span className="fund-review-detail-label">Account</span>{c.accountLabel}</div>
                {c.accountNumber && <div><span className="fund-review-detail-label">A/C Number</span>{c.accountNumber}</div>}
                <div><span className="fund-review-detail-label">Trxn ID</span>{c.trxId}</div>
                {c.comment && <div><span className="fund-review-detail-label">Comment</span>{c.comment}</div>}
                {c.adminNote && <div><span className="fund-review-detail-label">Admin note</span>{c.adminNote}</div>}
              </div>

              {c.status === "pending" && (
                <>
                  <input
                    type="text"
                    placeholder="Optional note (shown to the member, especially useful when rejecting)"
                    value={noteDraft[c.id] || ""}
                    onChange={(e) => setNoteDraft({ ...noteDraft, [c.id]: e.target.value })}
                    style={{ marginTop: 10 }}
                  />
                  <div className="fund-review-actions">
                    <button type="button" className="btn" style={{ width: "auto" }} disabled={busyId === c.id} onClick={() => handleApprove(c)}>
                      <Check size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                      Approve
                    </button>
                    <button type="button" className="btn-ghost btn" style={{ width: "auto" }} disabled={busyId === c.id} onClick={() => handleReject(c)}>
                      <X size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                      Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
