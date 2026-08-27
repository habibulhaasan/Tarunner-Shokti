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

// "Pharmacist" for the Pharmacy department, "Medical Technologist (X)" for
// every other department — the two professional titles this org's members
// actually hold.
function getProfessionalDesignation(profile) {
  if (!profile.department) return "";
  if (profile.department === "Pharmacy") return "Pharmacist";
  return `Medical Technologist (${profile.department})`;
}

// Institute name for a student, office name for a service holder — same
// logic as the ID card. instituteName isn't collected at registration yet
// (separate follow-up); reads it here so this picks it up automatically the
// moment that field exists.
function getPlaceLine(profile) {
  const emp = profile.employment;
  if (!emp?.status) return "";
  if (emp.status === "studying") return emp.instituteName || emp.institute || "";
  return emp.officeName || emp.govtOrg || "";
}

// Filename-safe tag for the downloaded PNG. No memberId-style format is
// defined for certificates, so this mirrors the ID card page's fallback.
function certificateFileTag(profile) {
  return profile.memberId || profile.id.slice(0, 6).toUpperCase();
}

export default function CertificatePage() {
  const { id: targetUid } = useParams();
  const { user, userDoc } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const frameRef = useRef(null);
  const { items, ready } = useMyContributions(targetUid);
  // Signatories are driven entirely by committee data: whichever roles an
  // admin flags "Signatory" in the Committee panel show up here, in role
  // order, with whoever currently holds that role pulled in live — no title
  // strings hardcoded here, so this stays correct automatically as the
  // committee (and its members) change.
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
    if (!frameRef.current) return;
    setDownloading(true);
    setDownloadError("");
    try {
      // Same approach as the ID card's download: self-hosted font (see
      // globals.css) lets html-to-image fetch/embed it same-origin, so the
      // exported PNG uses real Bangla metrics instead of a fallback font.
      const dataUrl = await toPng(frameRef.current, {
        pixelRatio: 4,
        backgroundColor: "#ffffff",
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
  // Same "সদস্য" default as the ID card — the person's designation within
  // TSPP itself, separate from their professional title above.
  const orgDesignation = (profile.committeeRoleId && rolesById[profile.committeeRoleId]?.title) || "সদস্য";

  return (
    <div className="memo-print-wrap">
      <div className="no-print memo-print-toolbar" style={{ width: "297mm", display: "flex", gap: 10 }}>
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

      <div className="certificate-page">
        <div className="certificate-frame" ref={frameRef}>
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
        </div>
      </div>
      <p className="helper-text no-print" style={{ textAlign: "center", marginTop: 6 }}>You can print it as per need.</p>
    </div>
  );
}