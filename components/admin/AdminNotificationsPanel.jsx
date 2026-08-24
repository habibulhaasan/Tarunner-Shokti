"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { Send, Megaphone, User as UserIcon } from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { sendNotification } from "../../lib/notifications";
import { defaultAvatarFor } from "../../lib/photoUtils";

function timeAgo(ts) {
  const date = ts?.toDate?.();
  if (!date) return "just now";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function memberPhoto(p) {
  return p.photo?.useDefault === false && p.photo?.base64 ? p.photo.base64 : defaultAvatarFor(p.gender);
}

// department + session is the identifying pair used everywhere else in the
// app (directory rows, admin list items) — reusing it here instead of email
// keeps member identification consistent across the whole admin UI.
function memberSubline(p) {
  const parts = [p.department, p.session].filter(Boolean);
  return parts.length ? parts.join(" · ") : p.email;
}

export default function AdminNotificationsPanel() {
  const { user: adminUser } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [audience, setAudience] = useState("all"); // "all" | "user"
  const [targetUids, setTargetUids] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "profiles"), (snap) => {
      setProfiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(30));
    const unsub = onSnapshot(q, (snap) => setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    const pool = profiles.filter((p) => !targetUids.includes(p.id));
    if (!q) return pool.slice(0, 8);
    return pool
      .filter((p) => p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [profiles, memberSearch, targetUids]);

  const selectedProfiles = targetUids.map((uid) => profiles.find((p) => p.id === uid)).filter(Boolean);
  const canSend = title.trim() && body.trim() && (audience === "all" || targetUids.length > 0);

  const addTarget = (uid) => {
    setTargetUids((ids) => (ids.includes(uid) ? ids : [...ids, uid]));
    setMemberSearch("");
  };

  const removeTarget = (uid) => setTargetUids((ids) => ids.filter((id) => id !== uid));

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setSentMsg("");
    try {
      if (audience === "all") {
        await sendNotification({ title, body, audience: "all", targetUid: null, createdBy: adminUser.uid });
        setSentMsg("Sent to all members.");
      } else {
        // One doc per recipient — the read side already queries per-targetUid,
        // so this needs no schema or rules changes to support multiple people.
        await Promise.all(
          targetUids.map((uid) => sendNotification({ title, body, audience: "user", targetUid: uid, createdBy: adminUser.uid }))
        );
        setSentMsg(
          targetUids.length === 1
            ? `Sent to ${selectedProfiles[0]?.name || "member"}.`
            : `Sent to ${targetUids.length} members.`
        );
      }
      setTitle("");
      setBody("");
      setTargetUids([]);
      setMemberSearch("");
    } finally {
      setSending(false);
      setTimeout(() => setSentMsg(""), 3000);
    }
  };

  return (
    <div className="admin-notify-layout">
      <div className="admin-panel-section">
        <h3>Send a notification</h3>
        <p className="step-sub">Reaches members in-app under their Notifications tab.</p>

        <div className="field">
          <label>Audience</label>
          <div className="pill-group">
            <button type="button" className={`pill ${audience === "all" ? "active" : ""}`} onClick={() => setAudience("all")}>
              <Megaphone size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />
              Everyone
            </button>
            <button type="button" className={`pill ${audience === "user" ? "active" : ""}`} onClick={() => setAudience("user")}>
              <UserIcon size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />
              Specific member(s)
            </button>
          </div>
        </div>

        {audience === "user" && (
          <div className="field">
            <label>Members</label>

            {selectedProfiles.length > 0 && (
              <div className="notify-selected-chips">
                {selectedProfiles.map((p) => (
                  <span key={p.id} className="notify-selected-chip">
                    <img src={memberPhoto(p)} alt="" className="notify-chip-avatar" />
                    {p.name || "(no name)"}
                    <button type="button" onClick={() => removeTarget(p.id)} aria-label={`Remove ${p.name}`}>×</button>
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder="Search name or email to add…"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
            {memberSearch && (
              <div className="notify-member-results">
                {filteredMembers.map((p) => (
                  <button key={p.id} type="button" className="notify-member-result" onClick={() => addTarget(p.id)}>
                    <img src={memberPhoto(p)} alt={p.name} className="notify-member-avatar" />
                    <div className="notify-member-result-text">
                      <span className="notify-selected-name">{p.name || "(no name)"}</span>
                      <span className="notify-selected-sub">{memberSubline(p)}</span>
                    </div>
                  </button>
                ))}
                {filteredMembers.length === 0 && <p className="helper-text">No matches.</p>}
              </div>
            )}
          </div>
        )}

        <div className="field">
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Blood donation camp this Friday" />
        </div>

        <div className="field">
          <label>Message</label>
          <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the notification body…" />
        </div>

        <button className="btn" style={{ width: "auto" }} onClick={handleSend} disabled={!canSend || sending}>
          <Send size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          {sending ? "Sending…" : "Send notification"}
        </button>
        {sentMsg && <span style={{ marginLeft: 12, color: "var(--forest)", fontSize: 13.5 }}>{sentMsg}</span>}
      </div>

      <div className="admin-panel-section">
        <h3>Recently sent</h3>
        <ul className="notify-history-list">
          {history.map((n) => (
            <li key={n.id}>
              <div className="notification-item-top">
                <span className="notification-title">{n.title}</span>
                <span className="notify-audience-chip">{n.audience === "all" ? "All members" : "Direct"}</span>
              </div>
              <p className="notification-body">{n.body}</p>
              <div className="notification-meta">{timeAgo(n.createdAt)}</div>
            </li>
          ))}
          {history.length === 0 && <p className="helper-text">Nothing sent yet.</p>}
        </ul>
      </div>
    </div>
  );
}