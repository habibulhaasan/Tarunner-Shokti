"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useSiteStatus } from "../lib/siteStatus";
import MaintenancePage from "./MaintenancePage";
import AppShell from "./nav/AppShell";

const AUTH_GATEWAY_PATHS = ["/login", "/register", "/forgot-password"];

function isOpenPath(pathname) {
  return (
    pathname === "/" ||
    pathname === "/about-us" ||
    pathname === "/info" ||
    pathname === "/committee" ||
    pathname === "/notices" ||
    pathname === "/constitution" ||
    pathname === "/archive" ||
    pathname.startsWith("/memo/")
  );
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

    if (!user && !isOpen && !isGateway) {
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

  // Maintenance mode: only blocks login and register pages so the
  // landing page stays live. Admins bypass completely.
  const MAINTENANCE_BLOCKED_PATHS = ["/login", "/register"];
  if (!live && !isAdmin && MAINTENANCE_BLOCKED_PATHS.includes(pathname)) {
    return <MaintenancePage />;
  }

  const isGateway = AUTH_GATEWAY_PATHS.includes(pathname);
  const isPublicPage =
    pathname === "/" ||
    pathname === "/about-us" ||
    pathname === "/committee" ||
    pathname === "/notices" ||
    pathname === "/constitution" ||
    pathname === "/archive";

  const showShell =
    !!user &&
    !!userDoc?.profileComplete &&
    !isGateway &&
    !isPublicPage &&
    pathname !== "/onboarding" &&
    pathname !== "/info";

  return showShell ? <AppShell>{children}</AppShell> : children;
}
