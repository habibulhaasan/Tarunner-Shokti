"use client";

import React from "react";
import { Landmark } from "lucide-react";

/**
 * Normalizes provider string into one of the supported keys:
 * "bkash" | "nagad" | "rocket" | "cellfin" | "bank"
 */
export function getPaymentMethodKey(provider = "") {
  const p = String(provider || "").trim().toLowerCase();
  if (p.includes("bkash") || p.includes("বিকাশ")) return "bkash";
  if (p.includes("nagad") || p.includes("নগদ")) return "nagad";
  if (p.includes("rocket") || p.includes("রকেট")) return "rocket";
  if (p.includes("cellfin") || p.includes("celfin") || p.includes("সেলফিন")) return "cellfin";
  return "bank";
}

export const PAYMENT_METHOD_OPTIONS = [
  { value: "bKash", label: "bKash (বিকাশ)" },
  { value: "Nagad", label: "Nagad (নগদ)" },
  { value: "Rocket", label: "Rocket (রকেট)" },
  { value: "Cellfin", label: "Cellfin (সেলফিন)" },
  { value: "Bank", label: "Bank (ব্যাংক ট্রান্সফার)" },
  { value: "Other Bank", label: "Other Bank (অন্যান্য ব্যাংক)" },
];

export default function PaymentLogo({
  provider = "",
  size = "md",
  className = "",
  style = {},
  showName = false,
}) {
  const key = getPaymentMethodKey(provider);

  // Height configurations
  const heightMap = {
    sm: 24,
    md: 32,
    lg: 40,
  };
  const h = heightMap[size] || 32;

  const logos = {
    bkash: { src: "/payment/bkash.svg", alt: "bKash", label: "bKash" },
    nagad: { src: "/payment/nagad.svg", alt: "Nagad", label: "Nagad" },
    rocket: { src: "/payment/rocket.svg", alt: "Rocket", label: "Rocket" },
    cellfin: { src: "/payment/cellfin.svg", alt: "Cellfin", label: "Cellfin" },
    bank: { src: "/payment/bank.svg", alt: "Bank", label: "Bank" },
  };

  // If it's a specific custom bank name other than generic "Bank"
  const isCustomBank =
    key === "bank" &&
    Boolean(provider) &&
    !["bank", "ব্যাংক", "bank transfer"].includes(provider.trim().toLowerCase());

  if (isCustomBank) {
    return (
      <span
        className={`payment-method-badge payment-method-bank-custom ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: `${h}px`,
          padding: "0 10px",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "#ffffff",
          borderRadius: "8px",
          fontSize: size === "sm" ? 11.5 : 13,
          fontWeight: 700,
          userSelect: "none",
          flexShrink: 0,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
          ...style,
        }}
        title={provider}
      >
        <Landmark size={size === "sm" ? 13 : 16} strokeWidth={2.2} style={{ color: "#38bdf8", flexShrink: 0 }} />
        <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {provider}
        </span>
      </span>
    );
  }

  const item = logos[key] || logos.bank;

  return (
    <span
      className={`payment-method-badge ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        verticalAlign: "middle",
        flexShrink: 0,
        ...style,
      }}
      title={provider || item.label}
    >
      <img
        src={item.src}
        alt={item.alt}
        style={{
          height: `${h}px`,
          width: "auto",
          maxWidth: "115px",
          objectFit: "contain",
          borderRadius: "7px",
          display: "block",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        }}
      />
    </span>
  );
}

