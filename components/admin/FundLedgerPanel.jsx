"use client";

import { Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useFundLedger, ledgerToCsv } from "../../lib/fundLedger";

function fmtDate(d) {
  try {
    return d.toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return "";
  }
}

function MonthlyChart({ data }) {
  if (data.length === 0) return <p className="helper-text">Not enough activity yet to chart.</p>;

  const max = Math.max(1, ...data.map((m) => Math.max(m.credit, m.debit)));
  const chartHeight = 140;

  return (
    <div className="ledger-chart">
      {data.map((m) => (
        <div key={m.key} className="ledger-chart-col">
          <div className="ledger-chart-bars" style={{ height: chartHeight }}>
            <div
              className="ledger-bar ledger-bar-credit"
              style={{ height: `${(m.credit / max) * 100}%` }}
              title={`প্রাপ্তি: ৳${m.credit.toLocaleString()}`}
            />
            <div
              className="ledger-bar ledger-bar-debit"
              style={{ height: `${(m.debit / max) * 100}%` }}
              title={`ব্যয়: ৳${m.debit.toLocaleString()}`}
            />
          </div>
          <div className="ledger-chart-label">{m.label}</div>
        </div>
      ))}
    </div>
  );
}

function CategoryBreakdown({ data }) {
  if (data.length === 0) return <p className="helper-text">No expenses recorded yet.</p>;
  return (
    <div className="ledger-category-list">
      {data.map((c) => (
        <div key={c.category} className="ledger-category-row">
          <div className="ledger-category-top">
            <span>{c.category}</span>
            <span>৳{c.amount.toLocaleString()} ({c.pct.toFixed(0)}%)</span>
          </div>
          <div className="ledger-category-track">
            <div className="ledger-category-fill" style={{ width: `${c.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FundLedgerPanel() {
  const { transactions, totalCredits, totalDebits, balance, monthlyBreakdown, categoryBreakdown, ready } = useFundLedger();

  const handleExport = () => {
    const csv = ledgerToCsv(transactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fund-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!ready) return <p className="helper-text">Loading ledger…</p>;

  return (
    <div className="admin-panel-section">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3>আর্থিক লেজার (Financial Ledger)</h3>
        <button type="button" className="btn-ghost btn" style={{ width: "auto" }} onClick={handleExport} disabled={transactions.length === 0}>
          <Download size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Export CSV
        </button>
      </div>

      <div className="fund-summary-cards" style={{ marginTop: 14 }}>
        <div className="fund-summary-card">
          <div className="fund-summary-label">Total received</div>
          <div className="fund-summary-amount" style={{ color: "var(--success)" }}>৳{totalCredits.toLocaleString()}</div>
        </div>
        <div className="fund-summary-card">
          <div className="fund-summary-label">Total expenses</div>
          <div className="fund-summary-amount" style={{ color: "var(--danger)" }}>৳{totalDebits.toLocaleString()}</div>
        </div>
        <div className="fund-summary-card">
          <div className="fund-summary-label">Current balance</div>
          <div className="fund-summary-amount">৳{balance.toLocaleString()}</div>
        </div>
      </div>

      <h3 style={{ marginTop: 26 }}>মাসিক প্রবণতা (Last 6 months)</h3>
      <MonthlyChart data={monthlyBreakdown} />
      <div className="ledger-chart-legend">
        <span><span className="ledger-legend-dot ledger-legend-credit" /> প্রাপ্তি (Credit)</span>
        <span><span className="ledger-legend-dot ledger-legend-debit" /> ব্যয় (Debit)</span>
      </div>

      <h3 style={{ marginTop: 26 }}>ব্যয়ের ধরন অনুযায়ী বিভাজন</h3>
      <CategoryBreakdown data={categoryBreakdown} />

      <h3 style={{ marginTop: 26 }}>লেনদেনের ইতিহাস (Running balance)</h3>
      {transactions.length === 0 && <p className="helper-text">No transactions yet.</p>}
      <div className="fund-review-list">
        {transactions.map((tx) => (
          <div key={tx.id} className="fund-review-card ledger-row">
            <div className="fund-review-top">
              <div>
                <div className="fund-review-donor">
                  {tx.type === "credit" ? (
                    <ArrowUpRight size={15} style={{ verticalAlign: "-2px", color: "var(--success)", marginRight: 6 }} />
                  ) : (
                    <ArrowDownRight size={15} style={{ verticalAlign: "-2px", color: "var(--danger)", marginRight: 6 }} />
                  )}
                  {tx.label}
                </div>
                <div className="fund-review-meta">{tx.category} · {fmtDate(tx.date)}{tx.detail ? ` · ${tx.detail}` : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="fund-review-donor" style={{ color: tx.type === "credit" ? "var(--success)" : "var(--danger)" }}>
                  {tx.type === "credit" ? "+" : "−"}৳{tx.amount.toLocaleString()}
                </div>
                <div className="fund-review-meta">ব্যালেন্স: ৳{tx.balanceAfter.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
