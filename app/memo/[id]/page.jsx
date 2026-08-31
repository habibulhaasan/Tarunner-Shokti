"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, Download, FileText } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import Letterhead, { ORG_INFO } from "../../../components/common/Letterhead";
import { useMemoDoc } from "../../../lib/memos";

function fmtDate(d) {
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const bn = {
      "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
      "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
    };
    return (dd + "/" + mm + "/" + yyyy).replace(/[0-9]/g, (w) => bn[w]);
  } catch {
    return d;
  }
}
function getMemoTag(memoNo) {
  if (!memoNo) return "memo";
  return memoNo.replace(/[^ঀ-৿a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export default function MemoPrintPage() {
  const { id } = useParams();
  const { memo, notFound, ready } = useMemoDoc(id);
  const [downloadingImg, setDownloadingImg] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const memoRef = useRef(null);

  const getExportDataUrl = async () => {
    return await toPng(memoRef.current, {
      pixelRatio: 3,
      backgroundColor: "#ffffff",
      style: {
        width: "793.7px", height: "1122.5px", transform: "scale(1)", margin: "0"
      },
    });
  };

  const handleDownloadImage = async () => {
    if (!memoRef.current) return;
    setDownloadingImg(true);
    setDownloadError("");
    try {
      const dataUrl = await getExportDataUrl();
      const link = document.createElement("a");
      const tag = getMemoTag(memo?.memoNo);
      link.download = `Memo-${tag}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Memo image export failed:", err);
      setDownloadError("ছবি তৈরি করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setDownloadingImg(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!memoRef.current) return;
    setDownloadingPdf(true);
    setDownloadError("");
    try {
      const dataUrl = await getExportDataUrl();
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297);
      const tag = getMemoTag(memo?.memoNo);
      pdf.save(`Memo-${tag}.pdf`);
    } catch (err) {
      console.error("Memo PDF export failed:", err);
      setDownloadError("PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setDownloadingPdf(false);
    }
  };

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
        {downloadError && <span className="helper-text" style={{ marginRight: "auto", color: "var(--danger)" }}>{downloadError}</span>}
        
        <button type="button" className="btn-ghost btn" style={{ width: "auto", marginRight: 8 }} onClick={handleDownloadImage} disabled={downloadingImg || downloadingPdf}>
          <Download size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          {downloadingImg ? "ডাউনলোড হচ্ছে..." : "Image"}
        </button>
        <button type="button" className="btn-ghost btn" style={{ width: "auto", marginRight: 8, background: "var(--surface)", borderColor: "var(--line)" }} onClick={handleDownloadPdf} disabled={downloadingImg || downloadingPdf}>
          <FileText size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          {downloadingPdf ? "ডাউনলোড হচ্ছে..." : "PDF"}
        </button>
        
        <button type="button" className="btn" style={{ width: "auto" }} onClick={() => window.print()}>
          <Printer size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Print
        </button>
      </div>

      <span className="helper-text no-print" style={{ marginBottom: 8, display: "block", textAlign: "center" }}>
        <strong>Note:</strong> প্রিন্ট করার জন্য ডেস্কটপ ভিউ ব্যবহার করুন এরপর PDF/Image ডাউনলোড করে প্রিন্ট করুন.
      </span>

      <div className="memo-print-page-container"><div className="memo-print-page" ref={memoRef}>
        <img src="/logo.png" alt="" className="memo-watermark" />

        <div className="memo-print-inner">
          <Letterhead align="left" />

          <div className="memo-meta-row">
            <div>স্মারক নং: {memo.memoNo}</div>
            <div>তারিখ: {fmtDate(memo.date)}</div>
          </div>

          <div className="memo-subject">
            <span className="memo-subject-label">বিষয়:</span> {memo.title}
          </div>

          <div className="memo-body">{memo.content}</div>

          {memo.signatories?.length > 0 && (
            <div className="memo-signature-row">
              {memo.signatories.map((s) => (
                <div key={s.profileUid} className="memo-signature">
                  <div className="memo-signature-line" />
                  <div className="memo-signature-name">{s.name}</div>
                  <div className="memo-signature-role">{s.roleTitle}</div>
                  <div className="memo-signature-team">কেন্দ্রীয় কার্যনির্বাহী কমিটি</div>
                  <div className="memo-signature-org">{ORG_INFO.nameBn}</div>
                </div>
              ))}
            </div>
          )}

          <div className="memo-footer">
            অস্থায়ী কার্যালয়: মাতৃসদন ও শিশু স্বাস্থ্য প্রশিক্ষণ প্রতিষ্ঠান, আজিমপুর, ঢাকা | {ORG_INFO.email || "info.tarunnershokti@gmail.com"} | ০১৭৩৪২২৮৮৩০
          </div>
        </div>
      </div>
</div>
    </div>
  );
}