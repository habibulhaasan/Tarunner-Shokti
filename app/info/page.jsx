"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PublicInfoPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/committee");
  }, [router]);

  return (
    <div className="screen-center">
      <div className="loader" />
    </div>
  );
}