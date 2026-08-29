"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection, doc, onSnapshot, getDoc, setDoc, addDoc, updateDoc,
  query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { sendNotification } from "./notifications";
import { useExpenses } from "./fundExpenses";

// firestore.rules authorizes admin-write/everyone-read on the top-level
// "config" collection (same doc pattern as directorySettings.js), so fund
// visibility + the list of receiving accounts live there too.
const FUND_SETTINGS_DOC = doc(db, "config", "fundSettings");
const CONTRIBUTIONS_COL = collection(db, "fundContributions");

function defaultSettings() {
  return { visible: false, accounts: [] };
}

// ---------- Admin: visibility + receiving accounts ----------

export function useFundSettings() {
  const [settings, setSettings] = useState(defaultSettings());
  const [loaded, setLoaded] = useState(false);

  const loadOnce = useCallback(async () => {
    try {
      const snap = await getDoc(FUND_SETTINGS_DOC);
      setSettings({ ...defaultSettings(), ...(snap.exists() ? snap.data() : {}) });
    } catch (err) {
      console.error("fundSettings one-shot read failed:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    let settled = false;
    const watchdog = setTimeout(() => {
      if (!settled) { settled = true; loadOnce(); }
    }, 5000);

    const unsub = onSnapshot(
      FUND_SETTINGS_DOC,
      (snap) => {
        settled = true;
        clearTimeout(watchdog);
        setSettings({ ...defaultSettings(), ...(snap.exists() ? snap.data() : {}) });
        setLoaded(true);
      },
      (err) => {
        settled = true;
        clearTimeout(watchdog);
        console.error("fundSettings listener error — check firestore.rules for config/{doc}:", err);
        loadOnce();
      }
    );

    return () => { settled = true; clearTimeout(watchdog); unsub(); };
  }, [loadOnce]);

  return { settings, loaded };
}

export async function saveFundVisibility(visible) {
  await setDoc(FUND_SETTINGS_DOC, { visible, updatedAt: serverTimestamp() }, { merge: true });
}

export async function saveFundAccounts(accounts) {
  await setDoc(FUND_SETTINGS_DOC, { accounts, updatedAt: serverTimestamp() }, { merge: true });
}

function makeAccountId() {
  return `acct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newAccountDraft() {
  return { id: makeAccountId(), label: "", accountName: "", accountNumber: "", provider: "", active: true };
}

// ---------- User: submitting a contribution ----------

export async function submitContribution({ uid, accountId, accountLabel, accountNumber, amount, trxId, comment }) {
  await addDoc(CONTRIBUTIONS_COL, {
    uid,
    accountId,
    accountLabel,
    accountNumber: accountNumber || "",
    amount: Number(amount),
    trxId: trxId.trim(),
    comment: (comment || "").trim(),
    status: "pending",
    adminNote: "",
    createdAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
  });
}

export function useMyContributions(uid) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const q = query(CONTRIBUTIONS_COL, where("uid", "==", uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReady(true);
    });
    return () => unsub();
  }, [uid]);

  return { items, ready };
}

// ---------- Admin: reviewing all contributions ----------

export function useAllContributions() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const q = query(CONTRIBUTIONS_COL, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReady(true);
    });
    return () => unsub();
  }, []);

  return { items, ready };
}

export async function approveContribution({ contribution, adminUid, adminNote }) {
  await updateDoc(doc(db, "fundContributions", contribution.id), {
    status: "approved",
    adminNote: adminNote || "",
    reviewedAt: serverTimestamp(),
    reviewedBy: adminUid,
  });
  await sendNotification({
    title: "Donation approved",
    body: `Your contribution of ৳${contribution.amount.toLocaleString()} has been confirmed and added to the fund. Thank you!`,
    audience: "user",
    targetUid: contribution.uid,
    createdBy: adminUid,
  });
}

export async function rejectContribution({ contribution, adminUid, adminNote }) {
  await updateDoc(doc(db, "fundContributions", contribution.id), {
    status: "rejected",
    adminNote: adminNote || "",
    reviewedAt: serverTimestamp(),
    reviewedBy: adminUid,
  });
  await sendNotification({
    title: "Donation could not be confirmed",
    body: adminNote
      ? `Your contribution submission needs attention: ${adminNote}`
      : "Your contribution submission could not be confirmed against our records. Please check the details and resubmit.",
    audience: "user",
    targetUid: contribution.uid,
    createdBy: adminUid,
  });
}

// ---------- Balance ----------
// Current balance = total approved contributions minus total recorded
// expenses. Exposed as one hook so every screen (admin review, member
// Donate tab) shows the same number.
export function useApprovedContributions() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const q = query(CONTRIBUTIONS_COL, where("status", "==", "approved"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setReady(true);
      },
      (err) => {
        console.error("approvedContributions listener error:", err);
        setReady(true);
      }
    );
    return () => unsub();
  }, []);

  return { items, ready };
}

export function useFundBalance() {
  const { items, ready: contribReady } = useApprovedContributions();
  const { items: expenseItems, ready: expenseReady } = useExpenses();

  const approvedTotal = useMemo(
    () => items.reduce((sum, c) => sum + (c.amount || 0), 0),
    [items]
  );
  const expenseTotal = useMemo(
    () => expenseItems.reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenseItems]
  );
  const balance = approvedTotal - expenseTotal;

  return { approvedTotal, expenseTotal, balance, ready: contribReady && expenseReady };
}
