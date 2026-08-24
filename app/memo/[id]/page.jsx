"use client";

import { useParams } from "next/navigation";
import { Printer } from "lucide-react";
import Letterhead from "../../../components/common/Letterhead";
import { useMemoDoc } from "../../../lib/memos";

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: "long" });
  } catch {
    return d;
  }
}

export default function MemoPrintPage() {
  const { id } = useParams();
  const { memo, notFound, ready } = useMemoDoc(id);

  if (!ready) {
    return (
      <div className="screen-center">
        <div className="loader" />
      </div>
    );
  }

  if (notFound || !memo) {
    return (
      <div className="memo-print-wrap">
        <p className="helper-text" style={{ padding: 24 }}>
          This memo isn't available — it may have been removed, or isn't published yet.
        </p>
      </div>
    );
  }

  return (
    <div className="memo-print-wrap">
      <div className="no-print memo-print-toolbar">
        <button type="button" className="btn" style={{ width: "auto" }} onClick={() => window.print()}>
          <Printer size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Print
        </button>
      </div>

      <div className="memo-print-page">
        <Letterhead />

        <div className="memo-meta-row">
          <div>স্মারক নং: {memo.memoNo}</div>
          <div>তারিখ: {fmtDate(memo.date)}</div>
        </div>

        <div className="memo-subject">
          <span className="memo-subject-label">বিষয়:</span> {memo.title}
        </div>

        <div className="memo-body">{memo.content}</div>

        {memo.signatories?.length > 0 && (
          <div className="memo-signature-row">
            {memo.signatories.map((s) => (
              <div key={s.profileUid} className="memo-signature">
                <div className="memo-signature-line" />
                <div className="memo-signature-name">{s.name}</div>
                <div className="memo-signature-role">{s.roleTitle}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
