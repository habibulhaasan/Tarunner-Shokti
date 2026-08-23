"use client";

import { LogOut } from "lucide-react";

export default function MobileTopBar({ onLogout }) {
  return (
    <header className="dashboard-topbar-mobile">
      <span className="dashboard-brand">তারুণ্যের শক্তি</span>
      <button className="mobile-logout-btn" onClick={onLogout} aria-label="Log out">
        <LogOut size={18} />
      </button>
    </header>
  );
}