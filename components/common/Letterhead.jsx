"use client";

// Central place to tweak the organization's printed letterhead. Update these
// once and every printable document (memos today, anything else later) picks
// it up automatically.
// TODO: প্রকৃত ঠিকানা ও যোগাযোগ তথ্য দিয়ে প্রতিস্থাপন করুন
export const ORG_INFO = {
  logoSrc: "/logo.png",
  nameBn: "তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ",
  nameEn: "Tarunner Shakti Pharmacist Parishad",
  addressBn: "বাংলাদেশ",
  phone: "",
  email: "",
  website: "",
};

export default function Letterhead({ compact = false }) {
  return (
    <div className={`letterhead ${compact ? "letterhead-compact" : ""}`}>
      <div className="letterhead-row">
        {ORG_INFO.logoSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ORG_INFO.logoSrc} alt="" className="letterhead-logo" />
        )}
        <div className="letterhead-text">
          <div className="letterhead-name-bn">{ORG_INFO.nameBn}</div>
          <div className="letterhead-name-en">{ORG_INFO.nameEn}</div>
          {(ORG_INFO.addressBn || ORG_INFO.phone || ORG_INFO.email || ORG_INFO.website) && (
            <div className="letterhead-contact">
              {[ORG_INFO.addressBn, ORG_INFO.phone, ORG_INFO.email, ORG_INFO.website]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
        </div>
      </div>
      <div className="letterhead-rule" />
    </div>
  );
}
