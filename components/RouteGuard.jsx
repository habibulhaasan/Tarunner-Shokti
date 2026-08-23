"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import AppShell from "./nav/AppShell";

// Pre-login entry points: anonymous visitors can see these, and a logged-in,
// fully-onboarded user gets bounced away from them to /dashboard (no reason
// to show the landing/login/register pages to someone already signed in).
const AUTH_GATEWAY_PATHS = ["/", "/login", "/register", "/forgot-password"];

// Also viewable without an account, but — unlike the auth gateways above —
// a logged-in user is allowed to just look at them normally (no forced
// redirect). /memo/[id] only actually renders content when the memo itself
// is marked visible; that's enforced by firestore.rules + the page's own
// notFound handling, not by this guard.
function isOpenPath(pathname) {
  return AUTH_GATEWAY_PATHS.includes(pathname) || pathname === "/info" || pathname.startsWith("/memo/");
}

export default function RouteGuard({ children }) {
  const { user, userDoc, loading } = useAuth();
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
      // Only the auth-gateway pages force a signed-in user elsewhere — /info
      // and /memo/[id] stay viewable even while logged in.
      if (!incomplete && (isGateway || pathname === "/onboarding")) {
        router.replace("/dashboard");
        return;
      }
    }
  }, [user, userDoc, loading, pathname, router]);

  if (loading) {
    return (
      <div className="screen-center">
        <div className="loader" />
      </div>
    );
  }

  const isGateway = AUTH_GATEWAY_PATHS.includes(pathname);
  // Nav only makes sense once someone is authenticated, past onboarding, and
  // not on a gateway/standalone page — covers /dashboard, /admin, and
  // anything added later without needing to touch this file again.
  const showShell =
    !!user && !!userDoc?.profileComplete && !isGateway && pathname !== "/onboarding" && pathname !== "/info";

  return showShell ? <AppShell>{children}</AppShell> : children;
}
