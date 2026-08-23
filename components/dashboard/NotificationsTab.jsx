"use client";

import { useState } from "react";
import { Bell, CheckCheck, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications, markNotificationRead } from "../../lib/notifications";
import { useMyFeedback, submitFeedback } from "../../lib/feedback";

function timeAgo(ts) {
  const date = ts?.toDate?.();
  if (!date) return "";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function NotificationsTab() {
  const { user } = useAuth();
  const { notifications, unreadCount, ready } = useNotifications(user?.uid);
  const { items: feedbackItems, ready: feedbackReady } = useMyFeedback(user?.uid);
  const [tab, setTab] = useState("notifications"); // "notifications" | "feedback"
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markNotificationRead(user.uid, n.id)));
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await submitFeedback({ uid: user.uid, message });
      setMessage("");
      setSentMsg("Sent to the admin team.");
    } finally {
      setSending(false);
      setTimeout(() => setSentMsg(""), 3000);
    }
  };

  return (
    <div className="notifications-tab">
      <div className="notifications-header">
        <h2>Notifications</h2>
        {tab === "notifications" && unreadCount > 0 && (
          <button type="button" className="link-button" onClick={markAllRead}>
            <CheckCheck size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="pill-group" style={{ marginTop: 10, marginBottom: 16 }}>
        <button type="button" className={`pill ${tab === "notifications" ? "active" : ""}`} onClick={() => setTab("notifications")}>
          Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
        </button>
        <button type="button" className={`pill ${tab === "feedback" ? "active" : ""}`} onClick={() => setTab("feedback")}>
          Send feedback
        </button>
      </div>

      {tab === "notifications" ? (
        <>
          <p className="step-sub">{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}</p>

          {!ready && <p className="helper-text">Loading notifications…</p>}

          {ready && notifications.length === 0 && (
            <div className="notifications-empty">
              <Bell size={28} />
              <p>No notifications yet.</p>
            </div>
          )}

          <ul className="notifications-list">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`notification-item ${n.read ? "" : "unread"}`}
                onClick={() => !n.read && markNotificationRead(user.uid, n.id)}
              >
                <div className="notification-item-top">
                  <span className="notification-title">{n.title}</span>
                  {!n.read && <span className="notification-dot" aria-label="Unread" />}
                </div>
                <p className="notification-body">{n.body}</p>
                <div className="notification-meta">
                  {n.audience === "all" ? "Announcement" : "Direct message"} · {timeAgo(n.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="step-sub">Send a note to the admin team — they'll reply here and you'll get a notification.</p>
          <form onSubmit={handleSendFeedback} className="admin-panel-section">
            <div className="field">
              <label>Your message</label>
              <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share a suggestion, issue, or question…" />
            </div>
            <button className="btn" style={{ width: "auto" }} type="submit" disabled={!message.trim() || sending}>
              <Send size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
              {sending ? "Sending…" : "Send"}
            </button>
            {sentMsg && <span style={{ marginLeft: 12, color: "var(--success)", fontSize: 13.5 }}>{sentMsg}</span>}
          </form>

          <h3 style={{ marginTop: 24 }}>Your feedback history</h3>
          {!feedbackReady && <p className="helper-text">Loading…</p>}
          {feedbackReady && feedbackItems.length === 0 && <p className="helper-text">You haven't sent any feedback yet.</p>}
          <div className="fund-review-list">
            {feedbackItems.map((f) => (
              <div key={f.id} className="fund-review-card">
                <div className="fund-review-top">
                  <div className="fund-review-meta">{timeAgo(f.createdAt)}</div>
                  <span className={`fund-status-badge ${f.status === "open" ? "fund-status-pending" : "fund-status-approved"}`}>
                    {f.status}
                  </span>
                </div>
                <p className="notification-body" style={{ marginTop: 6 }}>{f.message}</p>
                {f.adminRemark && (
                  <div className="fund-review-details">
                    <div><span className="fund-review-detail-label">Admin remark</span>{f.adminRemark}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
