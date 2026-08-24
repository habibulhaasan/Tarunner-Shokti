"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { Printer, Download } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";
import { defaultAvatarFor } from "../../../lib/photoUtils";
import { getAddressLabel } from "../../../lib/bdData";

function fallbackMemberId(uid) {
  // Deliberately plain digits/letters only — no locale-based number
  // formatting anywhere near this, so it always renders in standard
  // numerals even though the rest of the card is in Bangla.
  return `TSPP-${uid.slice(0, 6).toUpperCase()}`;
}

// "শিক্ষার্থী" (student) or a job title/employer line — whatever's on file.
function getStatusLine(profile) {
  const emp = profile.employment;
  if (!emp) return "";
  if (emp.status === "studying") return "শিক্ষার্থী";
  if (emp.jobType === "govt") return emp.officeName || emp.govtOrg || "কর্মরত";
  if (emp.jobType === "non-govt") return emp.officeName || "কর্মরত";
  return "";
}

// Not collected at registration yet (to be added there separately) — reads
// from employment.instituteName so the card picks it up automatically the
// moment that field exists, with zero further changes needed here.
function getInstituteLine(profile) {
  return profile.employment?.instituteName || profile.employment?.institute || "";
}

export default function IdCardPage() {
  const { id: targetUid } = useParams();
  const { user, userDoc } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

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

  useEffect(() => {
    if (!profile) return;
    const memberId = profile.memberId || fallbackMemberId(profile.id);
    const verifyText = typeof window !== "undefined" ? `${window.location.origin}/id-card/${profile.id}` : memberId;
    QRCode.toDataURL(verifyText, { margin: 0, width: 200, color: { dark: "#0f172a", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [profile]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // pixelRatio pushes the exported PNG to print-quality resolution even
      // though the on-screen element itself is deliberately tiny (true
      // physical card size) — the file keeps the exact card proportions,
      // just rendered at higher DPI.
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 4, cacheBust: true, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      const memberId = profile.memberId || fallbackMemberId(profile.id);
      link.download = `id-card-${memberId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("ID card image export failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (!isAdmin && !isSelf && user) {
    return (
      <div className="memo-print-wrap">
        <p className="helper-text" style={{ padding: 24 }}>আপনি শুধুমাত্র নিজের আইডি কার্ড দেখতে পারবেন।</p>
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

  if (!profile) {
    return (
      <div className="screen-center">
        <div className="loader" />
      </div>
    );
  }

  const memberId = profile.memberId || fallbackMemberId(profile.id);
  const avatar = profile.photo?.useDefault === false && profile.photo?.base64 ? profile.photo.base64 : defaultAvatarFor(profile.gender);
  const issued = new Date().toLocaleDateString("en-GB"); // en-GB -> plain numerals, dd/mm/yyyy
  const statusLine = getStatusLine(profile);
  const isStudent = profile.employment?.status === "studying";
  const instituteLine = isStudent ? getInstituteLine(profile) : "";
  const addressLine = getAddressLabel(profile.currentAddress, "bn");

  return (
    <div className="memo-print-wrap">
      <div className="no-print id-card-toolbar">
        <button type="button" className="btn" style={{ width: "auto" }} onClick={() => window.print()}>
          <Printer size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          প্রিন্ট
        </button>
        <button type="button" className="btn-ghost btn" style={{ width: "auto" }} onClick={handleDownload} disabled={downloading}>
          <Download size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          {downloading ? "তৈরি হচ্ছে…" : "ছবি ডাউনলোড"}
        </button>
      </div>

      <div className="id-card-stage">
        <div className="id-card" ref={cardRef}>
          <div className="id-card-header">
            <img src="/logo.png" alt="" className="id-card-logo" />
            <span>তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ</span>
          </div>

          <div className="id-card-body">
            <img src={avatar} alt="" className="id-card-photo" />
            <div className="id-card-info">
              <div className="id-card-name">{profile.name}</div>
              {statusLine && <div className="id-card-status">{statusLine}</div>}
              {isStudent && instituteLine && <div className="id-card-row"><span>ইনস্টিটিউট</span>{instituteLine}</div>}
              <div className="id-card-row"><span>সদস্য নং</span>{memberId}</div>
              {profile.bloodGroup && <div className="id-card-row"><span>রক্তের গ্রুপ</span>{profile.bloodGroup}</div>}
              {addressLine && <div className="id-card-row id-card-address"><span>ঠিকানা</span><span className="id-card-address-value">{addressLine}</span></div>}
            </div>
          </div>

          <div className="id-card-footer">
            <span>ইস্যু: {issued}</span>
            {qrDataUrl && <img src={qrDataUrl} alt="QR" className="id-card-qr" />}
          </div>
        </div>
      </div>
      <p className="helper-text id-card-hint no-print">প্রকৃত আইডি কার্ডের সমান আকারে দেখানো হচ্ছে (85.6mm × 54mm)।</p>
    </div>
  );
}
