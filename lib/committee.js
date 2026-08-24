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

// The official ১০১-member কেন্দ্রীয় কমিটি পদবী কাঠামো. Positions ৬৬–১০০
// ("কার্যনির্বাহী সদস্য", 35 seats) collapse into a single role here since
// the data model already lets many members share one committeeRoleId — no
// need for 35 separately-numbered role entries, just assign this one role
// to up to 35 different people. Same for ১০১ ("সাধারণ সদস্য প্রতিনিধি").
export const TSPP_OFFICIAL_ROLES = [
  "সভাপতি (বা প্রধান সমন্বয়কারী)",
  "সহ-সভাপতি (১ম)",
  "সহ-সভাপতি (২য়)",
  "সহ-সভাপতি (৩য়)",
  "সহ-সভাপতি (৪র্থ)",
  "মহাসচিব",
  "যুগ্ম মহাসচিব (১ম)",
  "যুগ্ম মহাসচিব (২য়)",
  "যুগ্ম মহাসচিব (৩য়)",
  "যুগ্ম মহাসচিব (৪র্থ)",
  "সাংগঠনিক সম্পাদক",
  "সহ-সাংগঠনিক সম্পাদক (১ম)",
  "সহ-সাংগঠনিক সম্পাদক (২য়)",
  "সহ-সাংগঠনিক সম্পাদক (৩য়)",
  "দপ্তর সম্পাদক",
  "সহ-দপ্তর সম্পাদক (১ম)",
  "সহ-দপ্তর সম্পাদক (২য়)",
  "অর্থ সম্পাদক",
  "সহ-অর্থ সম্পাদক (১ম)",
  "সহ-অর্থ সম্পাদক (২য়)",
  "প্রচার ও প্রকাশনা সম্পাদক",
  "সহ-প্রচার সম্পাদক (১ম)",
  "সহ-প্রচার সম্পাদক (২য়)",
  "তথ্য ও গবেষণা সম্পাদক",
  "সহ-তথ্য ও গবেষণা সম্পাদক (১ম)",
  "সহ-তথ্য ও গবেষণা সম্পাদক (২য়)",
  "আইন ও মানবাধিকার সম্পাদক",
  "সহ-আইন সম্পাদক (১ম)",
  "সহ-আইন সম্পাদক (২য়)",
  "শিক্ষা ও প্রশিক্ষণ সম্পাদক",
  "সহ-শিক্ষা সম্পাদক (১ম)",
  "সহ-শিক্ষা সম্পাদক (২য়)",
  "পেশাগত উন্নয়ন সম্পাদক",
  "সহ-পেশাগত উন্নয়ন সম্পাদক (১ম)",
  "সহ-পেশাগত উন্নয়ন সম্পাদক (২য়)",
  "স্বাস্থ্য ও জনকল্যাণ সম্পাদক",
  "সহ-স্বাস্থ্য সম্পাদক (১ম)",
  "সহ-স্বাস্থ্য সম্পাদক (২য়)",
  "সমাজকল্যাণ সম্পাদক",
  "সহ-সমাজকল্যাণ সম্পাদক (১ম)",
  "সহ-সমাজকল্যাণ সম্পাদক (২য়)",
  "আন্তর্জাতিক বিষয়ক সম্পাদক",
  "সহ-আন্তর্জাতিক সম্পাদক (১ম)",
  "সহ-আন্তর্জাতিক সম্পাদক (২য়)",
  "আইটি ও যোগাযোগ সম্পাদক",
  "সহ-আইটি সম্পাদক (১ম)",
  "সহ-আইটি সম্পাদক (২য়)",
  "গণমাধ্যম সম্পাদক",
  "সহ-গণমাধ্যম সম্পাদক (১ম)",
  "সহ-গণমাধ্যম সম্পাদক (২য়)",
  "নারী বিষয়ক সম্পাদক",
  "সহ-নারী বিষয়ক সম্পাদক (১ম)",
  "সহ-নারী বিষয়ক সম্পাদক (২য়)",
  "যুব ও ছাত্র বিষয়ক সম্পাদক",
  "সহ-যুব সম্পাদক (১ম)",
  "সহ-যুব সম্পাদক (২য়)",
  "সাংস্কৃতিক সম্পাদক",
  "সহ-সাংস্কৃতিক সম্পাদক (১ম)",
  "সহ-সাংস্কৃতিক সম্পাদক (২য়)",
  "ক্রীড়া সম্পাদক",
  "সহ-ক্রীড়া সম্পাদক (১ম)",
  "সহ-ক্রীড়া সম্পাদক (২য়)",
  "ত্রাণ ও দুর্যোগ ব্যবস্থাপনা সম্পাদক",
  "সহ-ত্রাণ সম্পাদক (১ম)",
  "সহ-ত্রাণ সম্পাদক (২য়)",
  "কার্যনির্বাহী সদস্য",
  "সাধারণ সদস্য প্রতিনিধি",
];

// Appends the official structure to whatever roles already exist — skips
// any title that's already present (by exact text match) so clicking this
// more than once doesn't create duplicates. Existing custom roles an admin
// already added are left untouched.
export async function seedOfficialRoles(existingRoles) {
  const existingTitles = new Set(existingRoles.map((r) => r.title));
  let nextOrder = existingRoles.length ? Math.max(...existingRoles.map((r) => r.order ?? 0)) + 1 : 0;
  const additions = TSPP_OFFICIAL_ROLES.filter((title) => !existingTitles.has(title)).map((title) => ({
    id: `role_seed_${nextOrder++}_${Math.random().toString(36).slice(2, 6)}`,
    title,
    order: nextOrder - 1,
  }));
  const merged = [...existingRoles, ...additions];
  await saveCommitteeRoles(merged);
  return additions.length;
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
