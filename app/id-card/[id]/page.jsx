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
import { useCommitteeRoles } from "../../../lib/committee";

function fallbackMemberId(uid) {
  // Deliberately plain digits/letters only — no locale-based number
  // formatting anywhere near this, so it always renders in standard
  // numerals even though the rest of the card is in Bangla.
  return `TSPP-${uid.slice(0, 6).toUpperCase()}`;
}

// "শিক্ষার্থী" (Student) or "চাকুরীজীবী (সরকারি/বেসরকারি)" (Service Holder, Govt/Non-Govt).
function getStatusLabel(profile) {
  const emp = profile.employment;
  if (!emp?.status) return "";
  if (emp.status === "studying") return "শিক্ষার্থী (Student)";
  if (emp.jobType === "govt") return "চাকুরীজীবী (সরকারি)";
  if (emp.jobType === "non-govt") return "চাকুরীজীবী (বেসরকারি)";
  return "";
}

// Institute name for a student, office name for a service holder — shown
// under the status label. instituteName isn't collected at registration yet
// (separate follow-up); reads it here so the card picks it up automatically
// the moment that field exists, with zero further changes needed.
function getPlaceLine(profile) {
  const emp = profile.employment;
  if (!emp?.status) return "";
  if (emp.status === "studying") return emp.instituteName || emp.institute || "";
  return emp.officeName || emp.govtOrg || "";
}

export default function IdCardPage() {
  const { id: targetUid } = useParams();
  const { user, userDoc } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const cardRef = useRef(null);
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
    setDownloadError("");
    try {
      // Font is now self-hosted (see globals.css) instead of loaded from the
      // Google Fonts CDN, so html-to-image can fetch and embed it same-origin
      // without hitting CORS — no more skipFonts workaround needed, and the
      // export now uses the actual Noto Sans Bengali metrics instead of a
      // fallback font, which is what was causing text to wrap after download
      // even though it fit fine on-screen.
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 4,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      const memberId = profile.memberId || fallbackMemberId(profile.id);
      link.download = `id-card-${memberId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("ID card image export failed:", err);
      setDownloadError("ছবি তৈরি করা যায়নি। আবার চেষ্টা করুন, অথবা প্রিন্ট অপশন ব্যবহার করুন।");
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
  const statusLabel = getStatusLabel(profile);
  const isStudent = profile.employment?.status === "studying";
  const placeLine = getPlaceLine(profile);
  const addressLine = getAddressLabel(profile.currentAddress, "bn");
  // Every member's default designation is "সদস্য" (Member) unless they hold
  // a committee role, in which case that role title is shown instead.
  const designation = (profile.committeeRoleId && rolesById[profile.committeeRoleId]?.title) || "সদস্য";

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
      {downloadError && <p className="helper-text no-print" style={{ textAlign: "center", color: "var(--danger)", marginBottom: 10 }}>{downloadError}</p>}

      <div className="id-card-stage">
        <div className="id-card" ref={cardRef}>
          <img src="/logo.png" alt="" className="id-card-watermark" style={{ opacity: 0.12 }} />

          <div className="id-card-header" style={{ textAlign: "left" }}>
            <img
              src="/logo.png"
              alt=""
              className="id-card-logo"
              style={{ width: "5mm", height: "5mm", maxWidth: "5mm", maxHeight: "5mm", objectFit: "contain" }}
            />
            <div className="id-card-header-text">
              <span className="id-card-org-name">তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ</span>
              <span className="id-card-motto">একটা অরাজনৈতিক পেশাজীবি সংগঠন</span>
            </div>
          </div>

          <div className="id-card-body">
            <img src={avatar} alt="" className="id-card-photo" />
            <div className="id-card-info">
              <div className="id-card-name">{profile.name}{profile.department ? ` (${profile.department})` : ""}</div>
              <div className="id-card-designation">{designation}</div>
              {statusLabel && <div className="id-card-status">{statusLabel}</div>}
              {placeLine && <div className="id-card-row"><span>{isStudent ? "ইনস্টিটিউট" : "কর্মস্থল"}</span>{placeLine}</div>}
              <div className="id-card-row"><span>সদস্য নং</span>{memberId}</div>
              {profile.bloodGroup && <div className="id-card-row"><span>রক্তের গ্রুপ</span>{profile.bloodGroup}</div>}
              {profile.phone && <div className="id-card-row"><span>মোবাইল</span>{profile.phone}</div>}
              {addressLine && <div className="id-card-row id-card-address"><span>ঠিকানা</span><span className="id-card-address-value">{addressLine}</span></div>}
            </div>
          </div>

          <div className="id-card-footer">
            <span>ইস্যু: {issued}</span>
            {qrDataUrl && <img src={qrDataUrl} alt="QR" className="id-card-qr" />}
          </div>
        </div>
      </div>
      <p className="helper-text id-card-hint no-print">You can print it as per need.</p>
    </div>
  );
}
