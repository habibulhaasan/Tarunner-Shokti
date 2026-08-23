"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useFundSettings, saveFundVisibility, saveFundAccounts, newAccountDraft } from "../../lib/fundContributions";

export default function FundAccountsPanel() {
  const { settings, loaded } = useFundSettings();
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [draftAccounts, setDraftAccounts] = useState(null);
  const [savingAccounts, setSavingAccounts] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const accounts = draftAccounts ?? settings.accounts ?? [];

  const toggleVisibility = async () => {
    setSavingVisibility(true);
    try {
      await saveFundVisibility(!settings.visible);
    } finally {
      setSavingVisibility(false);
    }
  };

  const updateField = (id, field, value) => {
    setDraftAccounts(accounts.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const addAccount = () => {
    setDraftAccounts([...accounts, newAccountDraft()]);
  };

  const removeAccount = (id) => {
    setDraftAccounts(accounts.filter((a) => a.id !== id));
  };

  const save = async () => {
    setSavingAccounts(true);
    setSavedMsg("");
    try {
      await saveFundAccounts(accounts);
      setDraftAccounts(null);
      setSavedMsg("Saved.");
    } finally {
      setSavingAccounts(false);
      setTimeout(() => setSavedMsg(""), 2500);
    }
  };

  if (!loaded) return <p className="helper-text">Loading donation settings…</p>;

  return (
    <div className="admin-panel-section">
      <h3>Donation page visibility</h3>
      <p className="step-sub">
        Controls whether members see a "Donate" tab on their dashboard at all.
        Turning this off hides the page for everyone except admins.
      </p>
      <div className="directory-settings-row">
        <div className="directory-settings-text">
          <div className="directory-settings-label">Show donation page to members</div>
          <div className="directory-settings-sub">{settings.visible ? "Visible to all members" : "Hidden from members"}</div>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" checked={!!settings.visible} disabled={savingVisibility} onChange={toggleVisibility} />
          <span className="toggle-track"><span className="toggle-thumb" /></span>
        </label>
      </div>

      <h3 style={{ marginTop: 28 }}>Receiving accounts</h3>
      <p className="step-sub">
        Members choose one of these when submitting a contribution. Add as many as you like — bKash, Nagad, bank accounts, etc.
      </p>

      <div className="fund-account-list">
        {accounts.map((a) => (
          <div key={a.id} className="fund-account-card">
            <div className="fund-account-grid">
              <div className="field">
                <label>Label</label>
                <input
                  type="text"
                  placeholder="e.g. bKash (Personal)"
                  value={a.label}
                  onChange={(e) => updateField(a.id, "label", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Provider / Bank</label>
                <input
                  type="text"
                  placeholder="e.g. bKash, Nagad, Islami Bank"
                  value={a.provider}
                  onChange={(e) => updateField(a.id, "provider", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Account name</label>
                <input
                  type="text"
                  placeholder="Name on the account"
                  value={a.accountName}
                  onChange={(e) => updateField(a.id, "accountName", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Account number</label>
                <input
                  type="text"
                  placeholder="Account / wallet number"
                  value={a.accountNumber}
                  onChange={(e) => updateField(a.id, "accountNumber", e.target.value)}
                />
              </div>
            </div>
            <div className="fund-account-card-footer">
              <label className="toggle-switch toggle-switch-sm">
                <input type="checkbox" checked={a.active !== false} onChange={(e) => updateField(a.id, "active", e.target.checked)} />
                <span className="toggle-track"><span className="toggle-thumb" /></span>
              </label>
              <span className="helper-text" style={{ margin: 0 }}>{a.active !== false ? "Active" : "Hidden from members"}</span>
              <button type="button" className="link-danger" style={{ marginLeft: "auto" }} onClick={() => removeAccount(a.id)}>
                <Trash2 size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                Remove
              </button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && <p className="helper-text">No accounts yet — add one below.</p>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
        <button type="button" className="btn-ghost btn" style={{ width: "auto" }} onClick={addAccount}>
          <Plus size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Add account
        </button>
        <button type="button" className="btn" style={{ width: "auto" }} onClick={save} disabled={savingAccounts || !draftAccounts}>
          {savingAccounts ? "Saving…" : "Save changes"}
        </button>
        {savedMsg && <span style={{ color: "var(--success)", fontSize: 13.5 }}>{savedMsg}</span>}
      </div>
    </div>
  );
}
