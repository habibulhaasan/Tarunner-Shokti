"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, getDoc, setDoc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Same doc-in-"config" pattern as directorySettings.js / fundContributions.js.
const COMMITTEE_SETTINGS_DOC = doc(db, "config", "committeeSettings");

function defaultSettings() {
  return { roles: [] }; // [{ id, title, order }]
}

export function useCommitteeRoles() {
  const [settings, setSettings] = useState(defaultSettings());
  const [loaded, setLoaded] = useState(false);

  const loadOnce = useCallback(async () => {
    try {
      const snap = await getDoc(COMMITTEE_SETTINGS_DOC);
      setSettings({ ...defaultSettings(), ...(snap.exists() ? snap.data() : {}) });
    } catch (err) {
      console.error("committeeSettings one-shot read failed:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    let settled = false;
    const watchdog = setTimeout(() => { if (!settled) { settled = true; loadOnce(); } }, 5000);

    const unsub = onSnapshot(
      COMMITTEE_SETTINGS_DOC,
      (snap) => {
        settled = true;
        clearTimeout(watchdog);
        setSettings({ ...defaultSettings(), ...(snap.exists() ? snap.data() : {}) });
        setLoaded(true);
      },
      (err) => {
        settled = true;
        clearTimeout(watchdog);
        console.error("committeeSettings listener error — check firestore.rules for config/{doc}:", err);
        loadOnce();
      }
    );
    return () => { settled = true; clearTimeout(watchdog); unsub(); };
  }, [loadOnce]);

  const rolesById = useMemo(() => {
    const map = {};
    (settings.roles || []).forEach((r) => { map[r.id] = r; });
    return map;
  }, [settings.roles]);

  return { roles: settings.roles || [], rolesById, loaded };
}

export async function saveCommitteeRoles(roles) {
  await setDoc(COMMITTEE_SETTINGS_DOC, { roles, updatedAt: serverTimestamp() }, { merge: true });
}

function makeRoleId() {
  return `role_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newRoleDraft(nextOrder) {
  return { id: makeRoleId(), title: "", order: nextOrder };
}

// Every profile that currently has a committeeRoleId set, joined with the
// role's title/order. Profiles are already world-readable to signed-in
// members (see firestore.rules), so this just filters the same collection
// other tabs (Directory, Admin members list) already subscribe to.
export function useCommitteeMembers() {
  const { rolesById, loaded: rolesLoaded } = useCommitteeRoles();
  const [profiles, setProfiles] = useState([]);
  const [profilesReady, setProfilesReady] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "profiles"), (snap) => {
      setProfiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setProfilesReady(true);
    });
    return () => unsub();
  }, []);

  const members = useMemo(() => {
    return profiles
      .filter((p) => p.committeeRoleId && rolesById[p.committeeRoleId])
      .map((p) => ({ ...p, committeeRole: rolesById[p.committeeRoleId] }))
      .sort((a, b) => (a.committeeRole.order ?? 0) - (b.committeeRole.order ?? 0));
  }, [profiles, rolesById]);

  return { members, ready: rolesLoaded && profilesReady };
}

// Public (no login required) version for the /info page. Unlike
// useCommitteeMembers() above — which does an unfiltered collection scan
// that only works for signed-in readers — this uses a where-clause that
// exactly matches firestore.rules' condition (committeeRoleId != null), the
// same pattern already used for useVisibleMemos()/useExpenses() elsewhere,
// so it works for anonymous visitors too.
export function usePublicCommitteeMembers() {
  const { rolesById, loaded: rolesLoaded } = useCommitteeRoles();
  const [profiles, setProfiles] = useState([]);
  const [profilesReady, setProfilesReady] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "profiles"), where("committeeRoleId", "!=", null));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setProfiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setProfilesReady(true);
      },
      (err) => {
        console.error("public committee query failed:", err);
        setProfilesReady(true);
      }
    );
    return () => unsub();
  }, []);

  const members = useMemo(() => {
    return profiles
      .filter((p) => rolesById[p.committeeRoleId])
      .map((p) => ({ ...p, committeeRole: rolesById[p.committeeRoleId] }))
      .sort((a, b) => (a.committeeRole.order ?? 0) - (b.committeeRole.order ?? 0));
  }, [profiles, rolesById]);

  return { members, ready: rolesLoaded && profilesReady };
}
