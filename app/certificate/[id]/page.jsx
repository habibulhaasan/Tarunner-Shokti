"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { Printer } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";
import { useMyContributions } from "../../../lib/fundContributions";
import { useCommitteeMembers } from "../../../lib/committee";
import Letterhead, { ORG_INFO } from "../../../components/common/Letterhead";

// Fixed signatory roles for every certificate — real names are looked up
// live from whoever currently holds these committee roles, so this updates
// automatically as the committee changes with no code/content edits needed.
const CERTIFICATE_SIGNATORY_TITLES = ["সভাপতি (বা প্রধান সমন্বয়কারী)", "মহাসচিব", "অর্থ সম্পাদক"];

export default function CertificatePage() {
  const { id: targetUid } = useParams();
  const { user, userDoc } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const { items, ready } = useMyContributions(targetUid);
  const { members: committeeMembers } = useCommitteeMembers();

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

  const signatories = CERTIFICATE_SIGNATORY_TITLES.map((title) => {
    const holder = committeeMembers.find((m) => m.committeeRole.title === title);
    return { title, name: holder?.name || "" };
  });

  return (
    <div className="memo-print-wrap">
      <div className="no-print memo-print-toolbar" style={{ width: "297mm" }}>
        <button type="button" className="btn" style={{ width: "auto" }} onClick={() => window.print()}>
          <Printer size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Print
        </button>
      </div>

      <div className="certificate-page">
        <div className="certificate-frame">
          {ORG_INFO.logoSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ORG_INFO.logoSrc} alt="" className="certificate-watermark" />
          )}

          <div className="certificate-content">
            <Letterhead align="left" />

            <div className="certificate-title">অনুদান সনদপত্র</div>
            <div className="certificate-subtitle">Certificate of Donation</div>

            <p className="certificate-body">
              এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,{" "}
              <span className="certificate-highlight">{profile.name}</span>
              {profile.department ? ` (${profile.department}${profile.session ? `, ${profile.session}` : ""})` : ""}{" "}
              তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ-এর কল্যাণ তহবিলে সর্বমোট{" "}
              <span className="certificate-highlight">৳{total.toLocaleString()}</span> টাকা অনুদান প্রদান করেছেন। পরিষদের
              পক্ষ থেকে তাঁর এই মহতী অবদানের জন্য আন্তরিক কৃতজ্ঞতা ও ধন্যবাদ জ্ঞাপন করা হচ্ছে। ভবিষ্যতেও তাঁর এই সহযোগিতা
              অব্যাহত থাকবে বলে আমরা আশাবাদী।
            </p>

            <div className="certificate-meta-row">
              <div>তারিখ: {today}</div>
            </div>

            <div className="certificate-signature-row">
              {signatories.map((s) => (
                <div key={s.title} className="certificate-signature">
                  <div className="certificate-signature-line" />
                  {s.name && <div className="certificate-signature-name">{s.name}</div>}
                  <div>{s.title}</div>
                  <div className="certificate-esigned">ইলেকট্রনিকভাবে স্বাক্ষরিত</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
