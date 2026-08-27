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
    return new Date(d).toLocaleDateString(undefined, { dateStyle: "long" });
  } catch {
    return d;
  }
}

function getMemoTag(memoNo) {
  if (!memoNo) return "memo";
  return memoNo.replace(/[^à¦…-à¦¹0-9a-zA-Z-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export default function MemoPrintPage() {
  const { id } = useParams();
  const { memo, notFound, ready } = useMemoDoc(id);
  const [downloadingImg, setDownloadingImg] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const memoRef = useRef(null);

  const getExportDataUrl = async () => {
    // Generate image at standard high resolution with forced desktop dimensions
    // to strictly preserve the A4 aspect ratio regardless of screen width on mobile
    return await toPng(memoRef.current, {
      pixelRatio: 3,
      backgroundColor: "#ffffff",
      style: {
        width: "210mm",
        height: "297mm",
        transform: "none",
        padding: "15mm 16mm",
        margin: "0"
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
      setDownloadError("à¦›à¦¬à¦¿ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤ à¦†à¦¬à¦¾à¦° à¦šà§‡à¦·à§à¦Ÿà¦¾ à¦•à¦°à§à¦¨à¥¤");
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
      // A4 size is 210 x 297 mm
      pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297);
      const tag = getMemoTag(memo?.memoNo);
      pdf.save(`Memo-${tag}.pdf`);
    } catch (err) {
      console.error("Memo PDF export failed:", err);
      setDownloadError("PDF à¦¤à§ˆà¦°à¦¿ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤ à¦†à¦¬à¦¾à¦° à¦šà§‡à¦·à§à¦Ÿà¦¾ à¦•à¦°à§à¦¨à¥¤");
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
          This memo isn't available â€” it may have been removed, or isn't published yet.
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
          {downloadingImg ? "à¦¡à¦¾à¦‰à¦¨à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡..." : "Image"}
        </button>
        <button type="button" className="btn-ghost btn" style={{ width: "auto", marginRight: 8, background: "var(--surface)", borderColor: "var(--line)" }} onClick={handleDownloadPdf} disabled={downloadingImg || downloadingPdf}>
          <FileText size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          {downloadingPdf ? "à¦¡à¦¾à¦‰à¦¨à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡..." : "PDF"}
        </button>
        <button type="button" className="btn" style={{ width: "auto" }} onClick={() => window.print()}>
          <Printer size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Print
        </button>
      </div>

      <div className="memo-print-page" ref={memoRef}>
        <img src="/logo.png" alt="" className="memo-watermark" />

        <div className="memo-print-inner">
          <Letterhead align="left" />

          <div className="memo-meta-row">
            <div>à¦¸à§à¦®à¦¾à¦°à¦• à¦¨à¦‚: {memo.memoNo}</div>
            <div>à¦¤à¦¾à¦°à¦¿à¦–: {fmtDate(memo.date)}</div>
          </div>

          <div className="memo-subject">
            <span className="memo-subject-label">à¦¬à¦¿à¦·à§Ÿ:</span> {memo.title}
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

          <div className="memo-footer">
            à¦…à¦¸à§à¦¥à¦¾à§Ÿà§€ à¦•à¦¾à¦°à§à¦¯à¦¾à¦²à§Ÿ: à¦®à¦¾à¦¤à§ƒ à¦¸à¦¦à¦¨ à¦“ à¦¶à¦¿à¦¶à§ à¦¸à§à¦¬à¦¾à¦¸à§à¦¥à§à¦¯ à¦ªà§à¦°à¦¶à¦¿à¦•à§à¦·à¦£ à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨, à¦†à¦œà¦¿à¦®à¦ªà§à¦°, à¦¢à¦¾à¦•à¦¾ | {ORG_INFO.email || "info.tarunnershokti@gmail.com"} | à§¦à§§à§­à§©à§ªà§¨à§¨à§®à§®à§©à§¦
          </div>
        </div>
      </div>
    </div>
  );
}