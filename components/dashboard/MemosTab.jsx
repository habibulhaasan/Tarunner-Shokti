"use client";

import Link from "next/link";
import { FileText, Printer } from "lucide-react";
import { useVisibleMemos } from "../../lib/memos";

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return d;
  }
}

export default function MemosTab() {
  const { items, ready } = useVisibleMemos();

  return (
    <div>
      <h1>Memos</h1>
      <p className="step-sub">Official notices and memos (স্মারক নং).</p>

      {!ready && <p className="helper-text">Loading…</p>}
      {ready && items.length === 0 && <p className="helper-text">No memos have been published yet.</p>}

      <div className="fund-review-list" style={{ marginTop: 18 }}>
        {items.map((m) => (
          <div key={m.id} className="fund-review-card">
            <div className="fund-review-top">
              <div>
                <div className="fund-review-donor"><FileText size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />{m.memoNo}</div>
                <div className="fund-review-meta">{m.title} · {fmtDate(m.date)}</div>
              </div>
            </div>
            <div className="fund-review-actions">
              <Link href={`/memo/${m.id}`} target="_blank" className="btn" style={{ width: "auto" }}>
                <Printer size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                View / Print
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
