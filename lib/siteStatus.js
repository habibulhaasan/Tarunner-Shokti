"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Defaults to live:true so a missing doc (first deploy, before anyone has
// set it) never accidentally locks the whole site out.
const SITE_STATUS_DOC = doc(db, "siteStatus", "status");

function defaults() {
  return { live: true };
}

export function useSiteStatus() {
  const [status, setStatus] = useState(defaults());
  const [loaded, setLoaded] = useState(false);

  const loadOnce = useCallback(async () => {
    try {
      const snap = await getDoc(SITE_STATUS_DOC);
      setStatus({ ...defaults(), ...(snap.exists() ? snap.data() : {}) });
    } catch (err) {
      console.error("siteStatus one-shot read failed:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    let settled = false;
    const watchdog = setTimeout(() => { if (!settled) { settled = true; loadOnce(); } }, 5000);

    const unsub = onSnapshot(
      SITE_STATUS_DOC,
      (snap) => {
        settled = true;
        clearTimeout(watchdog);
        setStatus({ ...defaults(), ...(snap.exists() ? snap.data() : {}) });
        setLoaded(true);
      },
      (err) => {
        settled = true;
        clearTimeout(watchdog);
        console.error("siteStatus listener error:", err);
        loadOnce();
      }
    );
    return () => { settled = true; clearTimeout(watchdog); unsub(); };
  }, [loadOnce]);

  return { live: status.live !== false, loaded };
}

export async function saveSiteLive(live) {
  await setDoc(SITE_STATUS_DOC, { live, updatedAt: serverTimestamp() }, { merge: true });
}