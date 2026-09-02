"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { hasAdminAccess } from "../lib/permissions";

export default function AdminGuard({ children }) {
  const { userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!userDoc || !hasAdminAccess(userDoc.role)) {
      router.replace("/dashboard");
    }
  }, [userDoc, loading, router]);

  if (loading || !userDoc || !hasAdminAccess(userDoc.role)) {
    return <div className="screen-center"><div className="loader" /></div>;
  }

  return children;
}
