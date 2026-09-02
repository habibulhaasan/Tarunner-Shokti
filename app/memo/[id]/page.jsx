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

// A4 @ 96dpi. Shared by both the visible preview and the hidden export copy
// so the two numbers can never drift apart.
const EXPORT_WIDTH = 793.7;
const EXPORT_HEIGHT = 1122.5;

// Single source of truth for the memo markup — rendered twice below (once
// for the responsive on-screen preview, once for the hidden export copy)
// so they never fall out of sync.
function MemoDocument({ memo }) {
  return (
    <>
      <img src="/logo.png" alt="" className="memo-watermark" />
      <div className="memo-print-inner">
        <Letterhead align="left" />

        <div className="memo-meta-row">
          <div>স্মারক নং: {memo.memoNo}</div>
          <div>তারিখ: {fmtDate(memo.date)}</div>
        </div>

        {memo.topic && <div className="memo-topic">{memo.topic}</div>}

        <div className="memo-subject">
          <span className="memo-subject-label">বিষয়:</span> {memo.title}
        </div>

        {/* content is now rich-text HTML (bold/italic/underline/lists) from
            the admin panel's editor. Old plain-text memos render safely too
            since they contain no tags. */}
        <div className="memo-body" dangerouslySetInnerHTML={{ __html: memo.content }} />

        {memo.closingNote && <div className="memo-closing">{memo.closingNote}</div>}

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
          অস্থায়ী কার্যালয়: মাতৃসদন ও শিশু স্বাস্থ্য প্রশিক্ষণ প্রতিষ্ঠান, আজিমপুর, ঢাকা | {ORG_INFO.email || "info.tarunnershokti@gmail.com"} | ০১৭৩৪২২৮৮৩০
        </div>
      </div>
    </>
  );
}

export default function MemoPrintPage() {
  const { id } = useParams();
  const { memo, notFound, ready } = useMemoDoc(id);
  const [downloadingImg, setDownloadingImg] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  // Points at the HIDDEN, always full-size copy — never the responsive
  // on-screen preview. That's the whole fix: export no longer depends on
  // whatever CSS transform the current viewport happens to be applying.
  const exportRef = useRef(null);

  const getExportDataUrl = async () => {
    // Wait for the self-hosted Bangla webfonts to finish loading. Skipping
    // this is the classic cause of a "messy/wrapped" export: on a slow
    // mobile connection the canvas can get rasterized before the fonts are
    // ready, so it falls back to a system font with different glyph widths
    // and the text reflows differently than what's shown on screen.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready;
    }

    return await toPng(exportRef.current, {
      pixelRatio: 2, // 3x here can exceed canvas memory limits in budget
                      // Android browsers / in-app webviews (FB/Messenger),
                      // which silently corrupts the output. 2x is still
                      // plenty sharp for A4 print.
      backgroundColor: "#ffffff",
      width: EXPORT_WIDTH,
      height: EXPORT_HEIGHT,
    });
  };

  const handleDownloadImage = async () => {
    if (!exportRef.current) return;
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
      setDownloadError("ছবি তৈরি করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setDownloadingImg(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!exportRef.current) return;
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
      setDownloadError("PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।");
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
      </div>

      {/* Visible, responsive preview — purely for on-screen viewing.
          Scales down on phones via the existing CSS. No longer used
          for export, so its shrink transform can't leak into the file. */}
      <div className="memo-print-page-container">
        <div className="memo-print-page">
          <MemoDocument memo={memo} />
        </div>
      </div>

      {/* Hidden export copy: always rendered at true full A4 pixel size,
          off-screen, immune to any responsive/mobile CSS. This is what
          Image/PDF downloads actually capture. */}
      <div aria-hidden="true" style={{ position: "fixed", top: 0, left: "-10000px", pointerEvents: "none" }}>
        <div
          ref={exportRef}
          className="memo-print-page"
          style={{ width: EXPORT_WIDTH, height: EXPORT_HEIGHT, transform: "none", margin: 0 }}
        >
          <MemoDocument memo={memo} />
        </div>
      </div>
    </div>
  );
}