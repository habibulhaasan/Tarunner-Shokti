"use client";

import { useState } from "react";
import { Phone, Copy, Check } from "lucide-react";

// Full row: tel: link (click-to-dial) + a copy button with brief "copied" feedback.
export function PhoneAction({ phone }) {
  const [copied, setCopied] = useState(false);

  if (!phone) return null;

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — click-to-dial still works.
    }
  };

  return (
    <div className="phone-action">
      <a href={`tel:${phone}`} className="phone-action-dial" title="কল করতে ট্যাপ করুন">
        <Phone size={14} />
        <span>{phone}</span>
      </a>
      <button type="button" className="phone-action-copy" onClick={handleCopy} title="নম্বর কপি করুন">
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  );
}

// Compact icon-only version for tight table rows — click-to-dial, tooltip shows the number.
export function PhoneIconLink({ phone }) {
  if (!phone) return null;
  return (
    <a href={`tel:${phone}`} title={`${phone} — কল করতে ক্লিক করুন`} className="phone-icon-link" onClick={(e) => e.stopPropagation()}>
      <Phone size={15} />
    </a>
  );
}
