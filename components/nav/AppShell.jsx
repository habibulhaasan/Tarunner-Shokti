"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { User, Droplet, Users, Star, Shield, Bell, Info, HeartHandshake, Landmark, FileText, Calendar } from "lucide-react";
import { auth } from "../../lib/firebase";
import { clearSessionCookie } from "../../lib/sessionCookie";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../lib/notifications";
import { useFundSettings } from "../../lib/fundContributions";
import { useTabVisibility } from "../../lib/tabVisibility";
import DesktopSidebar from "./DesktopSidebar";
import MobileTopBar from "./MobileTopBar";
import MobileNav from "./MobileNav";
import MobileMoreSheet from "./MobileMoreSheet";

// Full nav item set, in the order the desktop sidebar shows them. Mobile
// splits this into "primary" (always visible in the bottom bar) vs.
// "overflow" (behind the More sheet) using MOBILE_PRIMARY_KEYS below —
// desktop is unaffected and just renders everything flat.
const DASHBOARD_TABS = [
  { key: "profile", label: "My Profile", icon: User },
  { key: "donations", label: "Blood Donations", icon: Droplet },
  { key: "directory", label: "Directory", icon: Users },
  { key: "committee", label: "Committee", icon: Landmark },
  { key: "memos", label: "Memos", icon: FileText },
  { key: "events", label: "Events", icon: Calendar },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "favorites", label: "Favorites", icon: Star },
  { key: "about", label: "About", icon: Info },
];

// Anything NOT in this list automatically falls into the mobile "More"
// sheet — so future tabs need zero nav-restructuring work, they just show
// up under More by default until explicitly promoted to primary here.
const MOBILE_PRIMARY_KEYS = ["profile", "directory", "notifications", "about"];

export default function AppShell({ children }) {
  const { user, userDoc } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = userDoc?.role === "admin";
  const { unreadCount } = useNotifications(user?.uid);
  const { settings: fundSettings } = useFundSettings();
  const { hidden: hiddenTabs } = useTabVisibility();
  const [moreOpen, setMoreOpen] = useState(false);

  const activeKey = pathname === "/admin" ? "admin" : searchParams.get("tab") || "profile";

  // The "Donate" tab is admin-controlled: hidden from regular members until
  // an admin flips fundSettings.visible on. Admins always see it themselves
  // so they can preview it before publishing.
  const showFundTab = isAdmin || fundSettings.visible;
  const baseTabs = showFundTab
    ? [...DASHBOARD_TABS, { key: "contribute", label: "Donate", icon: HeartHandshake }]
    : DASHBOARD_TABS;

  // Same admin-always-sees-everything pattern as the fund tab above, just
  // generalized to any tab via Admin → Tab visibility.
  const tabs = isAdmin ? baseTabs : baseTabs.filter((t) => !hiddenTabs.includes(t.key));

  const navItems = [
    ...tabs.map((t) => ({
      ...t,
      href: `/dashboard?tab=${t.key}`,
      badge: t.key === "notifications" && unreadCount > 0 ? unreadCount : null,
    })),
    ...(isAdmin ? [{ key: "admin", label: "Admin panel", icon: Shield, href: "/admin", badge: null }] : []),
  ];

  const mobilePrimary = navItems.filter((i) => MOBILE_PRIMARY_KEYS.includes(i.key));
  const mobileOverflow = navItems.filter((i) => !MOBILE_PRIMARY_KEYS.includes(i.key));
  const overflowActive = mobileOverflow.some((i) => i.key === activeKey);
  const overflowBadgeTotal = mobileOverflow.reduce((sum, i) => sum + (i.badge || 0), 0);

  const handleNavigate = (item) => {
    setMoreOpen(false);
    router.push(item.href);
  };

  const handleLogout = async () => {
    await clearSessionCookie();
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-shell">
      <DesktopSidebar
        items={navItems}
        activeKey={activeKey}
        onNavigate={handleNavigate}
        userEmail={user?.email}
        onLogout={handleLogout}
      />
      <MobileTopBar onLogout={handleLogout} />
      <main className="dashboard-main">{children}</main>
      <MobileNav
        primaryItems={mobilePrimary}
        activeKey={activeKey}
        onNavigate={handleNavigate}
        overflowActive={overflowActive}
        overflowBadge={overflowBadgeTotal}
        onMoreClick={() => setMoreOpen(true)}
      />
      <MobileMoreSheet
        open={moreOpen}
        items={mobileOverflow}
        activeKey={activeKey}
        onNavigate={handleNavigate}
        onClose={() => setMoreOpen(false)}
      />
    </div>
  );
}