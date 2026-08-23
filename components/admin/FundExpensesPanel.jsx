"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useExpenses, addExpense, deleteExpense } from "../../lib/fundExpenses";
import { useFundBalance } from "../../lib/fundContributions";

const CATEGORIES = ["General", "Event", "Medical camp", "Equipment", "Transport", "Admin/Ops", "Other"];

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return d;
  }
}

export default function FundExpensesPanel() {
  const { user: adminUser } = useAuth();
  const { items, ready } = useExpenses();
  const { approvedTotal, expenseTotal, balance } = useFundBalance();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const canSave = title.trim() && Number(amount) > 0 && !saving;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    try {
      await addExpense({ title, amount, category, note, date, createdBy: adminUser.uid });
      setTitle("");
      setAmount("");
      setNote("");
      setCategory(CATEGORIES[0]);
      setDate(new Date().toISOString().slice(0, 10));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await deleteExpense(id);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-panel-section">
      <div className="fund-summary-cards">
        <div className="fund-summary-card">
          <div className="fund-summary-label">Total received (approved)</div>
          <div className="fund-summary-amount">৳{approvedTotal.toLocaleString()}</div>
        </div>
        <div className="fund-summary-card">
          <div className="fund-summary-label">Total expenses</div>
          <div className="fund-summary-amount">৳{expenseTotal.toLocaleString()}</div>
        </div>
        <div className="fund-summary-card">
          <div className="fund-summary-label">Current balance</div>
          <div className="fund-summary-amount">৳{balance.toLocaleString()}</div>
        </div>
      </div>

      <h3 style={{ marginTop: 26 }}>Record an expense</h3>
      <form onSubmit={handleAdd}>
        <div className="fund-account-grid">
          <div className="field">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Blood camp refreshments" />
          </div>
          <div className="field">
            <label>Amount (৳)</label>
            <input type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 2500" />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Note (optional)</label>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any extra detail members should see" />
        </div>
        <button className="btn" style={{ width: "auto" }} type="submit" disabled={!canSave}>
          <Plus size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          {saving ? "Saving…" : "Add expense"}
        </button>
      </form>

      <h3 style={{ marginTop: 28 }}>Expense history</h3>
      {!ready && <p className="helper-text">Loading…</p>}
      {ready && items.length === 0 && <p className="helper-text">No expenses recorded yet.</p>}
      <div className="fund-review-list">
        {items.map((e) => (
          <div key={e.id} className="fund-review-card">
            <div className="fund-review-top">
              <div>
                <div className="fund-review-donor">{e.title}</div>
                <div className="fund-review-meta">{e.category} · {fmtDate(e.date)}</div>
              </div>
              <span className="fund-review-donor">৳{Number(e.amount).toLocaleString()}</span>
            </div>
            {e.note && <div className="fund-review-details"><div>{e.note}</div></div>}
            <div className="fund-review-actions">
              <button type="button" className="link-danger" disabled={busyId === e.id} onClick={() => handleDelete(e.id)}>
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
