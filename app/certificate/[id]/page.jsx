"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { Printer } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";
import { useMyContributions } from "../../../lib/fundContributions";
import Letterhead from "../../../components/common/Letterhead";

export default function CertificatePage() {
  const { id: targetUid } = useParams();
  const { user, userDoc } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const { items, ready } = useMyContributions(targetUid);

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

  if (!profile || !ready) {
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

  return (
    <div className="memo-print-wrap">
      <div className="no-print memo-print-toolbar">
        <button type="button" className="btn" style={{ width: "auto" }} onClick={() => window.print()}>
          <Printer size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Print
        </button>
      </div>

      <div className="certificate-page">
        <Letterhead />

        <div className="certificate-title">অনুদান সনদপত্র</div>
        <div className="certificate-subtitle">Certificate of Donation</div>

        <p className="certificate-body">
          এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,{" "}
          <span className="certificate-highlight">{profile.name}</span>
          {profile.department ? ` (${profile.department}${profile.session ? `, ${profile.session}` : ""})` : ""}{" "}
          তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ-এর কল্যাণ তহবিলে সর্বমোট{" "}
          <span className="certificate-highlight">৳{total.toLocaleString()}</span> টাকা অনুদান প্রদান করেছেন।
        </p>

        <p className="certificate-body">
          পরিষদের পক্ষ থেকে তাঁর এই মহতী অবদানের জন্য আন্তরিক কৃতজ্ঞতা ও ধন্যবাদ জ্ঞাপন করা হচ্ছে।
        </p>

        <div className="certificate-meta-row">
          <div>তারিখ: {today}</div>
        </div>

        <div className="certificate-signature-row">
          <div className="certificate-signature">
            <div className="certificate-signature-line" />
            সাধারণ সম্পাদক
          </div>
          <div className="certificate-signature">
            <div className="certificate-signature-line" />
            সভাপতি
          </div>
        </div>
      </div>
    </div>
  );
}
