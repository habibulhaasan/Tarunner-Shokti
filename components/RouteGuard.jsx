"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useSiteStatus } from "../lib/siteStatus";
import MaintenancePage from "./MaintenancePage";
import AppShell from "./nav/AppShell";

const AUTH_GATEWAY_PATHS = ["/", "/login", "/register", "/forgot-password"];

function isOpenPath(pathname) {
  return AUTH_GATEWAY_PATHS.includes(pathname) || pathname === "/info" || pathname.startsWith("/memo/");
}

export default function RouteGuard({ children }) {
  const { user, userDoc, loading } = useAuth();
  const { live, loaded: statusLoaded } = useSiteStatus();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isGateway = AUTH_GATEWAY_PATHS.includes(pathname);
    const isOpen = isOpenPath(pathname);

    if (!user && !isOpen) {
      router.replace("/login");
      return;
    }

    if (user && userDoc) {
      const incomplete = !userDoc.profileComplete;
      if (incomplete && pathname !== "/onboarding") {
        router.replace("/onboarding");
        return;
      }
      if (!incomplete && (isGateway || pathname === "/onboarding")) {
        router.replace("/dashboard");
        return;
      }
    }
  }, [user, userDoc, loading, pathname, router]);

  if (loading || !statusLoaded) {
    return (
      <div className="screen-center">
        <div className="loader" />
      </div>
    );
  }

  const isAdmin = userDoc?.role === "admin";

  // Maintenance mode: blocks everyone except signed-in admins and the
  // /login page itself (so an admin can actually sign in to flip it back).
  if (!live && !isAdmin && pathname !== "/login") {
    return <MaintenancePage />;
  }

  const isGateway = AUTH_GATEWAY_PATHS.includes(pathname);
  const showShell =
    !!user && !!userDoc?.profileComplete && !isGateway && pathname !== "/onboarding" && pathname !== "/info";

  return showShell ? <AppShell>{children}</AppShell> : children;
}