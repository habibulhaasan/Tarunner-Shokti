"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { toPng } from "html-to-image";
import { Printer, Download } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";
import { useMyContributions } from "../../../lib/fundContributions";
import { useSignatoryMembers, useCommitteeRoles } from "../../../lib/committee";
import Letterhead, { ORG_INFO } from "../../../components/common/Letterhead";

function getProfessionalDesignation(profile) {
  if (!profile.department) return "";
  if (profile.department === "Pharmacy") return "Pharmacist";
  return `Medical Technologist (${profile.department})`;
}

function getPlaceLine(profile) {
  const emp = profile.employment;
  if (!emp?.status) return "";
  if (emp.status === "studying") return emp.instituteName || emp.institute || "";
  return emp.officeName || emp.govtOrg || "";
}

function certificateFileTag(profile) {
  return profile.memberId || profile.id.slice(0, 6).toUpperCase();
}

// 297mm x 210mm @ 96dpi — the certificate's true landscape A4 size.
const EXPORT_WIDTH = 1122.5;
const EXPORT_HEIGHT = 793.7;

// Shared markup — rendered once for the visible (responsive) preview and
// once for the hidden, always-full-size export copy, so the two can never
// drift out of sync.
function CertificateBody({ profile, today, total, signatories, professionalDesignation, placeLine, orgDesignation }) {
  return (
    <>
      {ORG_INFO.logoSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ORG_INFO.logoSrc} alt="" className="certificate-watermark" />
      )}

      <div className="certificate-content">
        <Letterhead align="left" />

        <div className="certificate-date-row">তারিখ: {today}</div>

        <div className="certificate-middle">
          <div className="certificate-title">অনুদান সনদপত্র</div>
          <div className="certificate-subtitle">Certificate of Donation</div>

          <p className="certificate-body">
            এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,{" "}
            <span className="certificate-highlight">{profile.name}</span>
            {professionalDesignation ? `, ${professionalDesignation}` : ""}
            {placeLine ? `, ${placeLine}` : ""}, তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ-এর{" "}
            <span className="certificate-highlight">{orgDesignation}</span>, কল্যাণ তহবিলে সর্বমোট{" "}
            <span className="certificate-highlight">৳{total.toLocaleString()}</span> টাকা অনুদান প্রদান করেছেন। পরিষদের
            পক্ষ থেকে তাঁর এই মহতী অবদানের জন্য আন্তরিক কৃতজ্ঞতা ও ধন্যবাদ জ্ঞাপন করা হচ্ছে। ভবিষ্যতেও তাঁর এই সহযোগিতা
            অব্যাহত থাকবে বলে আমরা আশাবাদী।
          </p>
        </div>

        <div className="certificate-signature-row">
          {signatories.map((s) => (
            <div key={s.title} className="certificate-signature">
              {s.name && <div className="certificate-signature-name">{s.name}</div>}
              <div className="certificate-signature-line" />
              <div>{s.title}</div>
              <div className="certificate-esigned">ইলেকট্রনিকভাবে স্বাক্ষরিত</div>
            </div>
          ))}
          {signatories.length === 0 && (
            <p className="helper-text no-print">
              কোনো স্বাক্ষরকারী নির্ধারণ করা নেই — অ্যাডমিন প্যানেলের Committee ট্যাবে এক বা একাধিক পদবীকে
              "Signatory" হিসেবে চিহ্নিত করুন।
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default function CertificatePage() {
  const { id: targetUid } = useParams();
  const { user, userDoc } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  // Points at the hidden, always-full-size (297mm x 210mm) copy — never the
  // responsive on-screen preview. Same fix as the memo page: exporting the
  // live preview let mobile's responsive layout leak into the downloaded
  // image; capturing a detached, fixed-size clone guarantees identical
  // output on every device.
  const exportRef = useRef(null);

  const { items, ready } = useMyContributions(targetUid);
  const { signatories: signatoryMembers, ready: signatoriesReady } = useSignatoryMembers();
  const { rolesById } = useCommitteeRoles();

  const isAdmin = userDoc?.role === "admin";
  const isSelf = user?.uid === targetUid;

  useEffect(() => {
    if (!targetUid) return;
    getDoc(doc(db, "profiles", targetUid))
      .then((snap) => {
        if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [targetUid]);

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setDownloading(true);
    setDownloadError("");
    try {
      // Wait for the self-hosted Bangla webfonts to finish loading before
      // rasterizing — on a slow mobile connection html-to-image can fire
      // before they're ready and fall back to a system font with different
      // glyph metrics, which is what used to cause mismatched output.
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }

      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 3, // sharp enough to print/frame without risking the
                        // canvas-memory limits some mobile/in-app browsers
                        // hit at higher multipliers (the old value was 4)
        backgroundColor: "#ffffff",
        width: EXPORT_WIDTH,
        height: EXPORT_HEIGHT,
      });
      const link = document.createElement("a");
      link.download = `certificate-${certificateFileTag(profile)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Certificate image export failed:", err);
      setDownloadError("ছবি তৈরি করা যায়নি। আবার চেষ্টা করুন, অথবা প্রিন্ট অপশন ব্যবহার করুন।");
    } finally {
      setDownloading(false);
    }
  };

  if (!isAdmin && !isSelf && user) {
    return (
      <div className="memo-print-wrap">
        <p className="helper-text" style={{ padding: 24 }}>আপনি শুধুমাত্র নিজের সনদ দেখতে পারবেন।</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="memo-print-wrap">
        <p className="helper-text" style={{ padding: 24 }}>এই সদস্যের তথ্য পাওয়া যায়নি।</p>
      </div>
    );
  }

  if (!profile || !ready || !signatoriesReady) {
    return (
      <div className="screen-center">
        <div className="loader" />
      </div>
    );
  }

  const approved = items.filter((c) => c.status === "approved");
  const total = approved.reduce((sum, c) => sum + (c.amount || 0), 0);
  const today = new Date().toLocaleDateString(undefined, { dateStyle: "long" });

  if (total <= 0) {
    return (
      <div className="memo-print-wrap">
        <p className="helper-text" style={{ padding: 24 }}>
          এই সদস্যের এখনও কোনো নিশ্চিত (approved) অনুদান নেই, তাই সনদ তৈরি করা যাচ্ছে না।
        </p>
      </div>
    );
  }

  const signatories = signatoryMembers.map((m) => ({
    title: m.committeeRole.title,
    name: m.name,
  }));

  const professionalDesignation = getProfessionalDesignation(profile);
  const placeLine = getPlaceLine(profile);
  const orgDesignation = (profile.committeeRoleId && rolesById[profile.committeeRoleId]?.title) || "সদস্য";

  const bodyProps = { profile, today, total, signatories, professionalDesignation, placeLine, orgDesignation };

  return (
    <div className="memo-print-wrap">
      <div className="no-print memo-print-toolbar" style={{ width: "100%", maxWidth: "297mm", display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button type="button" className="btn" style={{ width: "auto" }} onClick={() => window.print()}>
          <Printer size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Print
        </button>
        <button type="button" className="btn-ghost btn" style={{ width: "auto" }} onClick={handleDownload} disabled={downloading}>
          <Download size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          {downloading ? "তৈরি হচ্ছে…" : "ছবি ডাউনলোড"}
        </button>
      </div>
      {downloadError && <p className="helper-text no-print" style={{ textAlign: "center", color: "var(--danger)", marginBottom: 10 }}>{downloadError}</p>}

      {/* Visible, responsive preview. `.certificate-preview` scopes the
          mobile-only readability tweaks in globals.css so they only ever
          touch this copy — never the hidden export node below. */}
      <div className="certificate-page certificate-preview">
        <div className="certificate-frame">
          <CertificateBody {...bodyProps} />
        </div>
      </div>

      {/* Hidden export copy: always rendered at true 297mm x 210mm pixel
          size, off-screen, and immune to any responsive/mobile CSS since it
          lacks the .certificate-preview class. This is what "ছবি ডাউনলোড"
          actually captures. `no-print` keeps it out of the Print button's
          output too. */}
      <div className="no-print" aria-hidden="true" style={{ position: "fixed", top: 0, left: "-10000px", pointerEvents: "none" }}>
        <div className="certificate-page" style={{ width: EXPORT_WIDTH, height: EXPORT_HEIGHT }}>
          <div ref={exportRef} className="certificate-frame" style={{ width: "100%", height: "100%" }}>
            <CertificateBody {...bodyProps} />
          </div>
        </div>
      </div>

      <p className="helper-text no-print" style={{ textAlign: "center", marginTop: 6 }}>You can print it as per need.</p>
    </div>
  );
}