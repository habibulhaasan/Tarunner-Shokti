"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import PaymentLogo from "../common/PaymentLogo";
import { useFundSettings, saveFundVisibility, saveFundAccounts, newAccountDraft } from "../../lib/fundContributions";

const STANDARD_PROVIDERS = ["bKash", "Nagad", "Rocket", "Cellfin", "Bank"];

function getMatchedStandardProvider(provider = "") {
  const p = (provider || "").trim().toLowerCase();
  if (p === "bkash" || p === "বিকাশ") return "bKash";
  if (p === "nagad" || p === "নগদ") return "Nagad";
  if (p === "rocket" || p === "রকেট") return "Rocket";
  if (p === "cellfin" || p === "celfin" || p === "সেলফিন") return "Cellfin";
  if (p === "bank" || p === "ব্যাংক" || p === "bank transfer") return "Bank";
  return null;
}

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

  const updateAccount = (id, patch) => {
    setDraftAccounts((prev) => {
      const list = prev ?? settings.accounts ?? [];
      return list.map((a) => (a.id === id ? { ...a, ...patch } : a));
    });
  };

  const updateField = (id, field, value) => {
    updateAccount(id, { [field]: value });
  };

  const addAccount = () => {
    const draft = newAccountDraft();
    setDraftAccounts((prev) => {
      const list = prev ?? settings.accounts ?? [];
      return [
        ...list,
        {
          ...draft,
          provider: "bKash",
          label: "bKash (Personal)",
        },
      ];
    });
  };

  const removeAccount = (id) => {
    setDraftAccounts((prev) => {
      const list = prev ?? settings.accounts ?? [];
      return list.filter((a) => a.id !== id);
    });
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
        {accounts.map((a) => {
          const matched = getMatchedStandardProvider(a.provider);
          const selectValue = matched || (a.provider ? "Other Bank" : "bKash");
          const isOtherBank = selectValue === "Other Bank";

          return (
            <div key={a.id} className="fund-account-card">
              <div
                className="fund-account-card-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <PaymentLogo provider={a.provider || selectValue} size="sm" />
                  <span style={{ fontWeight: 600, fontSize: 14, color: "var(--forest)" }}>
                    {a.label || a.provider || selectValue || "New Account"}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
                  {a.provider || selectValue}
                </span>
              </div>

              <div className="fund-account-grid">
                <div className="field">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ margin: 0 }}>Payment method / Provider / Bank</label>
                    <PaymentLogo provider={a.provider || selectValue} size="sm" />
                  </div>
                  <select
                    value={selectValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Other Bank") {
                        const isAlreadyOther = !STANDARD_PROVIDERS.includes(a.provider);
                        const bankName = isAlreadyOther && a.provider ? a.provider : "Islami Bank";
                        updateAccount(a.id, {
                          provider: bankName,
                          label: a.label && !a.label.includes("(Personal)") ? a.label : `${bankName} Account`,
                        });
                      } else {
                        const isDefaultLabel =
                          !a.label ||
                          [
                            "bKash (Personal)",
                            "Nagad (Personal)",
                            "Rocket (Personal)",
                            "Cellfin (Personal)",
                            "Bank Account",
                          ].includes(a.label) ||
                          a.label.endsWith("(Personal)");

                        const newLabel = isDefaultLabel
                          ? (val === "Bank" ? "Bank Account" : `${val} (Personal)`)
                          : a.label;

                        updateAccount(a.id, {
                          provider: val,
                          label: newLabel,
                        });
                      }
                    }}
                  >
                    <option value="bKash">bKash (বিকাশ)</option>
                    <option value="Nagad">Nagad (নগদ)</option>
                    <option value="Rocket">Rocket (রকেট)</option>
                    <option value="Cellfin">Cellfin (সেলফিন)</option>
                    <option value="Bank">Bank (ব্যাংক ট্রান্সফার)</option>
                    <option value="Other Bank">Other Bank (নির্দিষ্ট ব্যাংক)</option>
                  </select>
                  {isOtherBank && (
                    <input
                      type="text"
                      placeholder="e.g. Islami Bank, DBBL, City Bank"
                      value={a.provider && a.provider !== "Other Bank" ? a.provider : ""}
                      onChange={(e) => updateField(a.id, "provider", e.target.value)}
                      style={{ marginTop: 6 }}
                    />
                  )}
                </div>
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
        );
      })}
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
