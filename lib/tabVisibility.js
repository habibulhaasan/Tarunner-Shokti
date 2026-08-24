"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Same doc-in-"config" pattern as fundSettings/directorySettings/committeeSettings.
const TAB_VISIBILITY_DOC = doc(db, "config", "tabVisibility");

function defaultSettings() {
  return { hidden: [] }; // array of tab keys hidden from non-admin members
}

export function useTabVisibility() {
  const [settings, setSettings] = useState(defaultSettings());
  const [loaded, setLoaded] = useState(false);

  const loadOnce = useCallback(async () => {
    try {
      const snap = await getDoc(TAB_VISIBILITY_DOC);
      setSettings({ ...defaultSettings(), ...(snap.exists() ? snap.data() : {}) });
    } catch (err) {
      console.error("tabVisibility one-shot read failed:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    let settled = false;
    const watchdog = setTimeout(() => { if (!settled) { settled = true; loadOnce(); } }, 5000);

    const unsub = onSnapshot(
      TAB_VISIBILITY_DOC,
      (snap) => {
        settled = true;
        clearTimeout(watchdog);
        setSettings({ ...defaultSettings(), ...(snap.exists() ? snap.data() : {}) });
        setLoaded(true);
      },
      (err) => {
        settled = true;
        clearTimeout(watchdog);
        console.error("tabVisibility listener error:", err);
        loadOnce();
      }
    );
    return () => { settled = true; clearTimeout(watchdog); unsub(); };
  }, [loadOnce]);

  return { hidden: settings.hidden || [], loaded };
}

export async function saveHiddenTabs(hidden) {
  await setDoc(TAB_VISIBILITY_DOC, { hidden, updatedAt: serverTimestamp() }, { merge: true });
}
