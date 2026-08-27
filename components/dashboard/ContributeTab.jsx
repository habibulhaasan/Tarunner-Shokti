"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFundSettings, useMyContributions, useFundBalance, submitContribution } from "../../lib/fundContributions";
import { useExpenses } from "../../lib/fundExpenses";

function timeAgo(ts) {
  const date = ts?.toDate?.();
  if (!date) return "just now";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return d;
  }
}

export default function ContributeTab() {
  const { user } = useAuth();
  const { settings, loaded: settingsLoaded } = useFundSettings();
  const { items, ready } = useMyContributions(user?.uid);
  const { approvedTotal, expenseTotal, balance } = useFundBalance();
  const { items: expenses, ready: expensesReady } = useExpenses();

  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [trxId, setTrxId] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const activeAccounts = (settings.accounts || []).filter((a) => a.active !== false);

  const myApprovedTotal = useMemo(
    () => items.filter((c) => c.status === "approved").reduce((sum, c) => sum + (c.amount || 0), 0),
    [items]
  );

  const canSubmit = accountId && Number(amount) > 0 && trxId.trim() && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const account = activeAccounts.find((a) => a.id === accountId);
    setSubmitting(true);
    setSubmitMsg("");
    try {
      await submitContribution({
        uid: user.uid,
        accountId,
        accountLabel: account ? `${account.label} (${account.provider})` : "",
        accountNumber: account?.accountNumber || "",
        amount,
        trxId,
        comment,
      });
      setAmount("");
      setTrxId("");
      setComment("");
      setAccountId("");
      setSubmitMsg("Submitted — an admin will confirm it against the account balance shortly.");
    } catch (err) {
      console.error("submitContribution failed:", err);
      setSubmitMsg("Something went wrong, please try again.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitMsg(""), 5000);
    }
  };

  if (!settingsLoaded) return <p className="helper-text">Loading…</p>;

  return (
    <div className="contribute-tab">
      <h1>Donate</h1>
      <p className="step-sub">Support the community fund and track exactly where it goes.</p>

      {myApprovedTotal > 0 && (
        <Link href={`/certificate/${user.uid}`} target="_blank" className="btn-ghost btn certificate-link-btn">
          <Award size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          অনুদান সনদ
        </Link>
      )}

      <div className="fund-summary-cards">
        <div className="fund-summary-card">
          <div className="fund-summary-label">Current fund balance</div>
          <div className="fund-summary-amount">৳{balance.toLocaleString()}</div>
        </div>
        <div className="fund-summary-card">
          <div className="fund-summary-label">Your confirmed contributions</div>
          <div className="fund-summary-amount">৳{myApprovedTotal.toLocaleString()}</div>
        </div>
        <div className="fund-summary-card">
          <div className="fund-summary-label">Total spent so far</div>
          <div className="fund-summary-amount">৳{expenseTotal.toLocaleString()}</div>
        </div>
      </div>

      <div className="admin-panel-section" style={{ marginTop: 24 }}>
        <h3>Submit a contribution</h3>
        {activeAccounts.length === 0 ? (
          <p className="helper-text">No receiving accounts are configured yet — check back soon.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Send to</label>
              <div className="fund-account-choice-list">
                {activeAccounts.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    className={`fund-account-choice ${accountId === a.id ? "active" : ""}`}
                    onClick={() => setAccountId(a.id)}
                  >
                    <div className="fund-account-choice-label">{a.label}</div>
                    <div className="fund-account-choice-sub">{a.provider} · {a.accountName}</div>
                    <div className="fund-account-choice-number">{a.accountNumber}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Amount (৳)</label>
              <input type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 500" />
            </div>

            <div className="field">
              <label>Transaction ID</label>
              <input type="text" value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder="From the payment confirmation SMS/receipt" />
            </div>

            <div className="field">
              <label>Comment (optional)</label>
              <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Anything the admin should know" />
            </div>

            <button className="btn" style={{ width: "auto" }} type="submit" disabled={!canSubmit}>
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
            {submitMsg && <p className="helper-text" style={{ marginTop: 10 }}>{submitMsg}</p>}
          </form>
        )}
      </div>

      <div className="admin-panel-section" style={{ marginTop: 24 }}>
        <h3>Your contributions</h3>
        {!ready && <p className="helper-text">Loading…</p>}
        {ready && items.length === 0 && <p className="helper-text">You haven't submitted a contribution yet.</p>}
        <div className="fund-review-list">
          {items.map((c) => (
            <div key={c.id} className="fund-review-card">
              <div className="fund-review-top">
                <div>
                  <div className="fund-review-donor">৳{Number(c.amount).toLocaleString()}</div>
                  <div className="fund-review-meta">{c.accountLabel} · {timeAgo(c.createdAt)}</div>
                </div>
                <span className={`fund-status-badge fund-status-${c.status}`}>{c.status}</span>
              </div>
              <div className="fund-review-details">
                <div><span className="fund-review-detail-label">Trxn ID</span>{c.trxId}</div>
                {c.comment && <div><span className="fund-review-detail-label">Comment</span>{c.comment}</div>}
                {c.adminNote && <div><span className="fund-review-detail-label">Admin note</span>{c.adminNote}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="admin-panel-section" style={{ marginTop: 24 }}>
        <h3>Where the fund has gone</h3>
        {!expensesReady && <p className="helper-text">Loading…</p>}
        {expensesReady && expenses.length === 0 && <p className="helper-text">No expenses recorded yet.</p>}
        <div className="fund-review-list">
          {expenses.map((e) => (
            <div key={e.id} className="fund-review-card">
              <div className="fund-review-top">
                <div>
                  <div className="fund-review-donor">{e.title}</div>
                  <div className="fund-review-meta">{e.category} · {fmtDate(e.date)}</div>
                </div>
                <span className="fund-review-donor">৳{Number(e.amount).toLocaleString()}</span>
              </div>
              {e.note && <div className="fund-review-details"><div>{e.note}</div></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
