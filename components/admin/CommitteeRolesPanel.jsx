"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useCommitteeRoles, saveCommitteeRoles, newRoleDraft } from "../../lib/committee";

export default function CommitteeRolesPanel() {
  const { roles, loaded } = useCommitteeRoles();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const list = draft ?? roles;

  const updateTitle = (id, title) => {
    setDraft(list.map((r) => (r.id === id ? { ...r, title } : r)));
  };

  const addRole = () => {
    const nextOrder = list.length ? Math.max(...list.map((r) => r.order ?? 0)) + 1 : 0;
    setDraft([...list, newRoleDraft(nextOrder)]);
  };

  const removeRole = (id) => {
    setDraft(list.filter((r) => r.id !== id));
  };

  const move = (index, dir) => {
    const next = [...list];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next.map((r, i) => ({ ...r, order: i })));
  };

  const save = async () => {
    setSaving(true);
    setSavedMsg("");
    try {
      const cleaned = list
        .map((r, i) => ({ ...r, title: r.title.trim(), order: i }))
        .filter((r) => r.title);
      await saveCommitteeRoles(cleaned);
      setDraft(null);
      setSavedMsg("Saved.");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 2500);
    }
  };

  if (!loaded) return <p className="helper-text">Loading committee roles…</p>;

  return (
    <div className="admin-panel-section">
      <h3>Committee roles</h3>
      <p className="step-sub">
        Define the roles here, then assign one to each member from the member list (open a member and pick their role).
        Order here controls the order the committee page shows members in.
      </p>

      <div className="fund-account-list">
        {list.map((r, i) => (
          <div key={r.id} className="fund-account-card-footer" style={{ border: "1px solid var(--border, var(--line))", borderRadius: 10, padding: "10px 14px" }}>
            <GripVertical size={15} style={{ color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="e.g. President, General Secretary, Treasurer"
              value={r.title}
              onChange={(e) => updateTitle(r.id, e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" className="link-button" disabled={i === 0} onClick={() => move(i, -1)}>Up</button>
            <button type="button" className="link-button" disabled={i === list.length - 1} onClick={() => move(i, 1)}>Down</button>
            <button type="button" className="link-danger" onClick={() => removeRole(r.id)}>
              <Trash2 size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
              Remove
            </button>
          </div>
        ))}
        {list.length === 0 && <p className="helper-text">No roles yet — add one below.</p>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
        <button type="button" className="btn-ghost btn" style={{ width: "auto" }} onClick={addRole}>
          <Plus size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Add role
        </button>
        <button type="button" className="btn" style={{ width: "auto" }} onClick={save} disabled={saving || !draft}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        {savedMsg && <span style={{ color: "var(--success)", fontSize: 13.5 }}>{savedMsg}</span>}
      </div>
    </div>
  );
}
