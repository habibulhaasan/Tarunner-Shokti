"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Printer, Pencil, X, Search, Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAllMemos, createMemo, updateMemo, deleteMemo, toggleMemoVisibility } from "../../lib/memos";
import { useCommitteeMembers } from "../../lib/committee";
import { defaultAvatarFor } from "../../lib/photoUtils";

const DEFAULT_SIGNATORY_TITLES = ["সভাপতি", "সাংগঠনিক সম্পাদক", "মহাসচিব"];

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return d;
  }
}

function avatarFor(profile) {
  return profile.photo?.useDefault === false && profile.photo?.base64
    ? profile.photo.base64
    : defaultAvatarFor(profile.gender);
}

function emptyForm() {
  return {
    memoNo: "", title: "", topic: "", content: "", closingNote: "ধন্যবাদান্তে,",
    date: new Date().toISOString().slice(0, 10), visible: false, signatories: [],
  };
}

// A contentEditable HTML string is "empty" even when it contains stray
// tags like <p><br></p>, so we strip tags before checking for real text.
function isHtmlEmpty(html) {
  return !html || !html.replace(/<[^>]*>/g, "").trim();
}

// Lightweight rich-text editor (Bold/Italic/Underline/bullets/numbering)
// built on contentEditable + execCommand — no external dependency needed.
// It's deliberately uncontrolled: innerHTML is only set once on mount, and
// afterwards we read it out via onInput. Making this a controlled React
// component (re-setting innerHTML every render) would fight the browser's
// own cursor position on every keystroke.
function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const [, bump] = useState(0); // forces a re-render so toolbar active-states refresh

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally once — parent remounts this via `key` when the form (re)opens

  const exec = (command) => {
    editorRef.current?.focus();
    document.execCommand(command, false, null);
    onChange(editorRef.current?.innerHTML || "");
    bump((n) => n + 1);
  };

  const isActive = (command) => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  const ToolbarButton = ({ command, label, Icon }) => (
    <button
      type="button"
      className={isActive(command) ? "active" : ""}
      onMouseDown={(e) => e.preventDefault()} // keep focus/selection inside the editor
      onClick={() => exec(command)}
      title={label}
      aria-label={label}
    >
      <Icon size={15} />
    </button>
  );

  return (
    <div>
      <div className="rte-toolbar">
        <ToolbarButton command="bold" label="Bold" Icon={Bold} />
        <ToolbarButton command="italic" label="Italic" Icon={Italic} />
        <ToolbarButton command="underline" label="Underline" Icon={Underline} />
        <span className="rte-divider" />
        <ToolbarButton command="insertUnorderedList" label="Bullet list" Icon={List} />
        <ToolbarButton command="insertOrderedList" label="Numbered list" Icon={ListOrdered} />
      </div>
      <div
        ref={editorRef}
        className="rte-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || "")}
        data-placeholder={placeholder}
      />
    </div>
  );
}

export default function MemosPanel() {
  const { user: adminUser } = useAuth();
  const { items, ready } = useAllMemos();
  const { members: committeeMembers } = useCommitteeMembers();
  const [editingId, setEditingId] = useState(null); // null = not open, "new" = creating
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [signatorySearch, setSignatorySearch] = useState("");

  const openNew = () => {
    // Default-suggest whoever currently holds these three roles — still
    // fully editable/removable before saving.
    const defaults = DEFAULT_SIGNATORY_TITLES
      .map((title) => committeeMembers.find((m) => m.committeeRole.title === title))
      .filter(Boolean)
      .map((m) => ({ profileUid: m.id, name: m.name, roleTitle: m.committeeRole.title }));
    setForm({ ...emptyForm(), signatories: defaults });
    setEditingId("new");
  };

  const openEdit = (m) => {
    setForm({
      memoNo: m.memoNo, title: m.title, topic: m.topic || "", content: m.content,
      closingNote: m.closingNote || "", date: m.date,
      visible: m.visible, signatories: m.signatories || [],
    });
    setEditingId(m.id);
  };
  const closeForm = () => { setEditingId(null); setSignatorySearch(""); };

  const canSave = form.memoNo.trim() && form.title.trim() && !isHtmlEmpty(form.content) && !saving;

  const availableSignatories = useMemo(() => {
    const chosenUids = new Set(form.signatories.map((s) => s.profileUid));
    const pool = committeeMembers.filter((m) => !chosenUids.has(m.id));
    const q = signatorySearch.trim().toLowerCase();
    if (!q) return pool.slice(0, 8);
    return pool.filter((m) => m.name?.toLowerCase().includes(q) || m.committeeRole.title.toLowerCase().includes(q)).slice(0, 8);
  }, [committeeMembers, form.signatories, signatorySearch]);

  const addSignatory = (m) => {
    setForm((f) => ({ ...f, signatories: [...f.signatories, { profileUid: m.id, name: m.name, roleTitle: m.committeeRole.title }] }));
    setSignatorySearch("");
  };

  const removeSignatory = (uid) => {
    setForm((f) => ({ ...f, signatories: f.signatories.filter((s) => s.profileUid !== uid) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    try {
      if (editingId === "new") {
        await createMemo({ ...form, createdBy: adminUser.uid });
      } else {
        await updateMemo(editingId, form);
      }
      closeForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this memo permanently?")) return;
    setBusyId(id);
    try {
      await deleteMemo(id);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = async (m) => {
    setBusyId(m.id);
    try {
      await toggleMemoVisibility(m.id, !m.visible);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-panel-section">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
        <div>
          <h3>Memos (স্মারক নং)</h3>
          <p className="step-sub" style={{ marginTop: 2 }}>Create official memos with a letterhead-ready printable format. Toggle visibility to publish to members.</p>
        </div>
        {editingId === null && (
          <button type="button" className="btn" style={{ width: "auto", flexShrink: 0 }} onClick={openNew}>
            <Plus size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
            New memo
          </button>
        )}
      </div>

      {editingId !== null && (
        <form onSubmit={handleSave} className="fund-account-card" style={{ marginTop: 14 }}>
          <div className="fund-account-grid">
            <div className="field">
              <label>স্মারক নং (Memo No.)</label>
              <input type="text" value={form.memoNo} onChange={(e) => setForm({ ...form, memoNo: e.target.value })} placeholder="e.g. স্মারক নং: ২৩/২০২৬" />
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>

          <div className="field">
            <label>বিষয়ের ধরন (Topic)</label>
            <input
              type="text"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="উদা: প্রেস রিলিজ, শোক বার্তা, শুভেচ্ছা বার্তা"
            />
          </div>

          <div className="field">
            <label>বিষয় (Subject / Title)</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Subject line" />
          </div>

          <div className="field">
            <label>বিস্তারিত (Content)</label>
            <RichTextEditor
              key={editingId}
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              placeholder="Full memo text — use the toolbar to format."
            />
          </div>

          <div className="field">
            <label>ধন্যবাদান্তে (Closing note)</label>
            <input
              type="text"
              value={form.closingNote}
              onChange={(e) => setForm({ ...form, closingNote: e.target.value })}
              placeholder="ধন্যবাদান্তে,"
            />
          </div>

          <div className="field">
            <label>স্বাক্ষরকারী (Signatories)</label>
            {form.signatories.length > 0 && (
              <div className="notify-selected-chips">
                {form.signatories.map((s) => (
                  <span key={s.profileUid} className="notify-selected-chip">
                    {s.name} — {s.roleTitle}
                    <button type="button" onClick={() => removeSignatory(s.profileUid)} aria-label={`Remove ${s.name}`}>×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="committee-search-box" style={{ marginBottom: 0 }}>
              <Search size={15} />
              <input
                type="text"
                placeholder="কমিটি সদস্য খুঁজুন…"
                value={signatorySearch}
                onChange={(e) => setSignatorySearch(e.target.value)}
              />
            </div>
            {signatorySearch && (
              <div className="notify-member-results">
                {availableSignatories.map((m) => (
                  <button key={m.id} type="button" className="notify-member-result" onClick={() => addSignatory(m)}>
                    <img src={avatarFor(m)} alt={m.name} className="notify-member-avatar" />
                    <div className="notify-member-result-text">
                      <span className="notify-selected-name">{m.name}</span>
                      <span className="notify-selected-sub">{m.committeeRole.title}</span>
                    </div>
                  </button>
                ))}
                {availableSignatories.length === 0 && <p className="helper-text">No matches.</p>}
              </div>
            )}
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
                {saving ? "Saving…" : "Save memo"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="fund-review-list" style={{ marginTop: 18 }}>
        {!ready && <p className="helper-text">Loading memos…</p>}
        {ready && items.length === 0 && <p className="helper-text">No memos yet.</p>}
        {items.map((m) => (
          <div key={m.id} className="fund-review-card">
            <div className="fund-review-top">
              <div>
                <div className="fund-review-donor">{m.memoNo}</div>
                <div className="fund-review-meta">{m.title} · {fmtDate(m.date)}</div>
              </div>
              <span className={`fund-status-badge ${m.visible ? "fund-status-approved" : "fund-status-pending"}`}>
                {m.visible ? "visible" : "hidden"}
              </span>
            </div>

            <div className="fund-review-actions" style={{ flexWrap: "wrap" }}>
              <label className="toggle-switch toggle-switch-sm">
                <input type="checkbox" checked={!!m.visible} disabled={busyId === m.id} onChange={() => handleToggle(m)} />
                <span className="toggle-track"><span className="toggle-thumb" /></span>
              </label>
              <Link href={`/memo/${m.id}`} target="_blank" className="btn-ghost btn" style={{ width: "auto" }}>
                <Printer size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                View / Print
              </Link>
              <button type="button" className="btn-ghost btn" style={{ width: "auto" }} onClick={() => openEdit(m)}>
                <Pencil size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                Edit
              </button>
              <button type="button" className="link-danger" disabled={busyId === m.id} onClick={() => handleDelete(m.id)}>
                <Trash2 size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}