"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import QRCode from "qrcode";
import { Printer } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";
import { defaultAvatarFor } from "../../../lib/photoUtils";
import Letterhead from "../../../components/common/Letterhead";

function fallbackMemberId(uid) {
  return `TSPP-${uid.slice(0, 6).toUpperCase()}`;
}

export default function IdCardPage() {
  const { id: targetUid } = useParams();
  const { user, userDoc } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

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
    QRCode.toDataURL(verifyText, { margin: 1, width: 160, color: { dark: "#0f172a", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [profile]);

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
  const issued = new Date().toLocaleDateString(undefined, { dateStyle: "medium" });

  return (
    <div className="memo-print-wrap">
      <div className="no-print memo-print-toolbar">
        <button type="button" className="btn" style={{ width: "auto" }} onClick={() => window.print()}>
          <Printer size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Print
        </button>
      </div>

      <div className="id-card">
        <Letterhead compact />
        <div className="id-card-body">
          <img src={avatar} alt="" className="id-card-photo" />
          <div className="id-card-info">
            <div className="id-card-name">{profile.name}</div>
            {profile.department && <div className="id-card-dept">{profile.department}{profile.session ? ` · ${profile.session}` : ""}</div>}
            <div className="id-card-row"><span>সদস্য নং</span>{memberId}</div>
            {profile.bloodGroup && <div className="id-card-row"><span>রক্তের গ্রুপ</span>{profile.bloodGroup}</div>}
            <div className="id-card-row"><span>ইস্যুর তারিখ</span>{issued}</div>
          </div>
          {qrDataUrl && <img src={qrDataUrl} alt="QR" className="id-card-qr" />}
        </div>
      </div>
    </div>
  );
}
