"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Plus, Trash2, Pencil, X, MapPin, Users } from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import {
  useAllEvents, createEvent, updateEvent, deleteEvent, toggleEventVisibility, useEventRsvps,
} from "../../lib/events";

function fmtDateTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function emptyForm() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return { title: "", description: "", location: "", startAt: now.toISOString().slice(0, 16), endAt: "", visible: false };
}

function RsvpSummary({ eventId }) {
  const { items, ready } = useEventRsvps(eventId);
  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "profiles"), (snap) => {
      const map = {};
      snap.docs.forEach((d) => { map[d.id] = d.data(); });
      setProfiles(map);
    });
    return () => unsub();
  }, []);

  if (!ready) return <p className="helper-text">Loading RSVPs…</p>;
  const going = items.filter((r) => r.status === "going");
  const notGoing = items.filter((r) => r.status === "not_going");

  return (
    <div style={{ marginTop: 10 }}>
      <p className="helper-text" style={{ margin: 0 }}>
        <Users size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
        {going.length} going · {notGoing.length} not going
      </p>
      {going.length > 0 && (
        <p className="fund-review-meta" style={{ marginTop: 6 }}>
          {going.map((r) => profiles[r.uid]?.name || "(unknown)").join(", ")}
        </p>
      )}
    </div>
  );
}

export default function EventsPanel() {
  const { user: adminUser } = useAuth();
  const { items, ready } = useAllEvents();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const openNew = () => { setForm(emptyForm()); setEditingId("new"); };
  const openEdit = (e) => {
    setForm({
      title: e.title, description: e.description, location: e.location,
      startAt: e.startAt?.slice(0, 16) || "", endAt: e.endAt?.slice(0, 16) || "", visible: e.visible,
    });
    setEditingId(e.id);
  };
  const closeForm = () => setEditingId(null);

  const canSave = form.title.trim() && form.startAt && !saving;

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!canSave) return;
    setSaving(true);
    try {
      const payload = { ...form, startAt: new Date(form.startAt).toISOString(), endAt: form.endAt ? new Date(form.endAt).toISOString() : null };
      if (editingId === "new") {
        await createEvent({ ...payload, createdBy: adminUser.uid });
      } else {
        await updateEvent(editingId, payload);
      }
      closeForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event permanently?")) return;
    setBusyId(id);
    try {
      await deleteEvent(id);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = async (e) => {
    setBusyId(e.id);
    try {
      await toggleEventVisibility(e.id, !e.visible);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-panel-section">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <h3>Events &amp; calendar</h3>
          <p className="step-sub" style={{ marginTop: 2 }}>Create events, publish them to members, and see who's RSVP'd.</p>
        </div>
        {editingId === null && (
          <button type="button" className="btn" style={{ width: "auto" }} onClick={openNew}>
            <Plus size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
            New event
          </button>
        )}
      </div>

      {editingId !== null && (
        <form onSubmit={handleSave} className="fund-account-card" style={{ marginTop: 14 }}>
          <div className="field">
            <label>Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. বার্ষিক সাধারণ সভা" />
          </div>
          <div className="fund-account-grid">
            <div className="field">
              <label>Starts</label>
              <input type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
            </div>
            <div className="field">
              <label>Ends (optional)</label>
              <input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Venue / address" />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details members should know" />
          </div>
          <div className="fund-account-card-footer">
            <label className="toggle-switch toggle-switch-sm">
              <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
              <span className="toggle-track"><span className="toggle-thumb" /></span>
            </label>
            <span className="helper-text" style={{ margin: 0 }}>{form.visible ? "Visible to members" : "Hidden (draft)"}</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <button type="button" className="btn-ghost btn" style={{ width: "auto" }} onClick={closeForm}>
                <X size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />
                Cancel
              </button>
              <button type="submit" className="btn" style={{ width: "auto" }} disabled={!canSave}>
                {saving ? "Saving…" : "Save event"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="fund-review-list" style={{ marginTop: 18 }}>
        {!ready && <p className="helper-text">Loading events…</p>}
        {ready && items.length === 0 && <p className="helper-text">No events yet.</p>}
        {items.map((e) => (
          <div key={e.id} className="fund-review-card">
            <div className="fund-review-top">
              <div>
                <div className="fund-review-donor">{e.title}</div>
                <div className="fund-review-meta">
                  {fmtDateTime(e.startAt)}
                  {e.location && <> · <MapPin size={12} style={{ verticalAlign: "-1px" }} /> {e.location}</>}
                </div>
              </div>
              <span className={`fund-status-badge ${e.visible ? "fund-status-approved" : "fund-status-pending"}`}>
                {e.visible ? "visible" : "hidden"}
              </span>
            </div>

            <div className="fund-review-actions" style={{ flexWrap: "wrap" }}>
              <label className="toggle-switch toggle-switch-sm">
                <input type="checkbox" checked={!!e.visible} disabled={busyId === e.id} onChange={() => handleToggle(e)} />
                <span className="toggle-track"><span className="toggle-thumb" /></span>
              </label>
              <button type="button" className="btn-ghost btn" style={{ width: "auto" }} onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}>
                <Users size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                RSVPs
              </button>
              <button type="button" className="btn-ghost btn" style={{ width: "auto" }} onClick={() => openEdit(e)}>
                <Pencil size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                Edit
              </button>
              <button type="button" className="link-danger" disabled={busyId === e.id} onClick={() => handleDelete(e.id)}>
                <Trash2 size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                Delete
              </button>
            </div>

            {expandedId === e.id && <RsvpSummary eventId={e.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}
