"use client";

import { useState } from "react";
import { User, Droplet, Users, Landmark, FileText, Calendar, Bell, Star, Info } from "lucide-react";
import { useTabVisibility, saveHiddenTabs } from "../../lib/tabVisibility";

// Mirrors AppShell.jsx's DASHBOARD_TABS — "profile" is deliberately excluded
// here (and always shown) since it's the account/self-service page and the
// fallback tab when no ?tab= is set; hiding it would strand users on load.
// "contribute" (Donate) already has its own dedicated visibility toggle
// under Admin → Donations → Accounts & visibility, so it's not duplicated here.
const TOGGLEABLE_TABS = [
  { key: "donations", label: "Blood Donations", icon: Droplet },
  { key: "directory", label: "Directory", icon: Users },
  { key: "committee", label: "Committee", icon: Landmark },
  { key: "memos", label: "Memos", icon: FileText },
  { key: "events", label: "Events", icon: Calendar },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "favorites", label: "Favorites", icon: Star },
  { key: "about", label: "About", icon: Info },
];

export default function TabVisibilityPanel() {
  const { hidden, loaded } = useTabVisibility();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const current = draft ?? hidden;

  const toggle = (key) => {
    setDraft(current.includes(key) ? current.filter((k) => k !== key) : [...current, key]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveHiddenTabs(current);
      setDraft(null);
      setSavedMsg("Saved.");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 2500);
    }
  };

  if (!loaded) return <p className="helper-text">Loading…</p>;

  return (
    <div className="admin-panel-section">
      <h3>Tab visibility</h3>
      <p className="step-sub">
        Hide a tab from regular members' navigation without deleting anything — admins always see every tab
        regardless of these switches. "My Profile" can't be hidden since it's the account page members land on by default.
      </p>

      <div className="fund-account-list">
        {TOGGLEABLE_TABS.map((t) => {
          const isHidden = current.includes(t.key);
          return (
            <div key={t.key} className="directory-settings-row">
              <div className="directory-settings-text">
                <div className="directory-settings-label">
                  <t.icon size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                  {t.label}
                </div>
                <div className="directory-settings-sub">{isHidden ? "Hidden from members" : "Visible to members"}</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={!isHidden} onChange={() => toggle(t.key)} />
                <span className="toggle-track"><span className="toggle-thumb" /></span>
              </label>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
        <button type="button" className="btn" style={{ width: "auto" }} onClick={save} disabled={saving || !draft}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        {savedMsg && <span style={{ color: "var(--success)", fontSize: 13.5 }}>{savedMsg}</span>}
      </div>
    </div>
  );
}
