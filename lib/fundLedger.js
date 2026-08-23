"use client";

import { useMemo } from "react";
import { useAllContributions } from "./fundContributions";
import { useExpenses } from "./fundExpenses";

function toDate(value, fallbackTs) {
  if (value) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const fallback = fallbackTs?.toDate?.();
  return fallback || new Date(0);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

// Combines approved contributions (credits) and recorded expenses (debits)
// into one chronological ledger with a running balance, plus a few rollups
// (monthly credit/debit totals, expense-by-category) for the admin's
// financial-analytics view. Nothing here writes anything — it's a read-only
// projection over the two existing collections.
export function useFundLedger() {
  const { items: contributions, ready: cReady } = useAllContributions();
  const { items: expenses, ready: eReady } = useExpenses();

  const result = useMemo(() => {
    const credits = contributions
      .filter((c) => c.status === "approved")
      .map((c) => ({
        id: `contribution_${c.id}`,
        type: "credit",
        date: toDate(null, c.reviewedAt) || toDate(null, c.createdAt),
        amount: c.amount || 0,
        label: `অনুদান — ${c.accountLabel || ""}`.trim(),
        detail: c.trxId ? `Trxn: ${c.trxId}` : "",
        category: "Donation",
      }));

    const debits = expenses.map((e) => ({
      id: `expense_${e.id}`,
      type: "debit",
      date: toDate(e.date, e.createdAt),
      amount: e.amount || 0,
      label: e.title,
      detail: e.note || "",
      category: e.category || "General",
    }));

    const all = [...credits, ...debits].sort((a, b) => a.date - b.date);

    let running = 0;
    const withBalance = all.map((tx) => {
      running += tx.type === "credit" ? tx.amount : -tx.amount;
      return { ...tx, balanceAfter: running };
    });

    const totalCredits = credits.reduce((s, c) => s + c.amount, 0);
    const totalDebits = debits.reduce((s, d) => s + d.amount, 0);

    // Monthly rollup — last 6 months that actually have activity, oldest first.
    const monthly = {};
    withBalance.forEach((tx) => {
      const key = monthKey(tx.date);
      if (!monthly[key]) monthly[key] = { key, label: monthLabel(key), credit: 0, debit: 0 };
      if (tx.type === "credit") monthly[key].credit += tx.amount;
      else monthly[key].debit += tx.amount;
    });
    const monthlyBreakdown = Object.values(monthly).sort((a, b) => (a.key > b.key ? 1 : -1)).slice(-6);

    // Expense-by-category rollup, for the pie/bar-style breakdown.
    const categories = {};
    debits.forEach((d) => {
      categories[d.category] = (categories[d.category] || 0) + d.amount;
    });
    const categoryBreakdown = Object.entries(categories)
      .map(([category, amount]) => ({ category, amount, pct: totalDebits ? (amount / totalDebits) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);

    return {
      transactions: withBalance.slice().reverse(), // newest first for display
      totalCredits,
      totalDebits,
      balance: totalCredits - totalDebits,
      monthlyBreakdown,
      categoryBreakdown,
    };
  }, [contributions, expenses]);

  return { ...result, ready: cReady && eReady };
}

export function ledgerToCsv(transactions) {
  const header = ["Date", "Type", "Description", "Category", "Amount", "Balance after"];
  const rows = transactions
    .slice()
    .reverse() // chronological for the exported file
    .map((tx) => [
      tx.date.toISOString().slice(0, 10),
      tx.type === "credit" ? "Credit" : "Debit",
      `"${(tx.label || "").replace(/"/g, '""')}"`,
      tx.category,
      tx.type === "credit" ? tx.amount : -tx.amount,
      tx.balanceAfter,
    ]);
  return [header, ...rows].map((r) => r.join(",")).join("\n");
}
