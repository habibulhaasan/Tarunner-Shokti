"use client";

import { Calendar, MapPin, Check, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useVisibleEvents, useMyRsvp, setRsvp } from "../../lib/events";

function fmtDateTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function EventCard({ event, uid }) {
  const { status } = useMyRsvp(event.id, uid);
  const isPast = event.startAt && new Date(event.startAt) < new Date();

  return (
    <div className="fund-review-card">
      <div className="fund-review-top">
        <div>
          <div className="fund-review-donor"><Calendar size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />{event.title}</div>
          <div className="fund-review-meta">
            {fmtDateTime(event.startAt)}
            {event.location && <> · <MapPin size={12} style={{ verticalAlign: "-1px" }} /> {event.location}</>}
          </div>
        </div>
        {isPast && <span className="fund-status-badge fund-status-pending">সম্পন্ন</span>}
      </div>

      {event.description && <p className="notification-body" style={{ marginTop: 8 }}>{event.description}</p>}

      {!isPast && (
        <div className="fund-review-actions">
          <button
            type="button"
            className={`btn ${status === "going" ? "" : "btn-ghost"}`}
            style={{ width: "auto" }}
            onClick={() => setRsvp(event.id, uid, "going")}
          >
            <Check size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
            যাচ্ছি
          </button>
          <button
            type="button"
            className={`btn ${status === "not_going" ? "" : "btn-ghost"}`}
            style={{ width: "auto" }}
            onClick={() => setRsvp(event.id, uid, "not_going")}
          >
            <X size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
            যাচ্ছি না
          </button>
        </div>
      )}
    </div>
  );
}

export default function EventsTab() {
  const { user } = useAuth();
  const { items, ready } = useVisibleEvents();

  const now = new Date();
  const upcoming = items.filter((e) => !e.startAt || new Date(e.startAt) >= now);
  const past = items.filter((e) => e.startAt && new Date(e.startAt) < now).reverse();

  return (
    <div>
      <h1>Events</h1>
      <p className="step-sub">সংগঠনের অনুষ্ঠান, সভা ও কর্মসূচির তালিকা।</p>

      {!ready && <p className="helper-text">Loading…</p>}
      {ready && items.length === 0 && <p className="helper-text">এখনও কোনো ইভেন্ট প্রকাশ করা হয়নি।</p>}

      {upcoming.length > 0 && (
        <>
          <h3 style={{ marginTop: 18 }}>আসন্ন</h3>
          <div className="fund-review-list">
            {upcoming.map((e) => <EventCard key={e.id} event={e} uid={user?.uid} />)}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>অতীত</h3>
          <div className="fund-review-list">
            {past.map((e) => <EventCard key={e.id} event={e} uid={user?.uid} />)}
          </div>
        </>
      )}
    </div>
  );
}
