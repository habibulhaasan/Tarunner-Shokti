"use client";

import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// A single shared counter doc under the same "config" collection everything
// else's settings live in. Firestore transactions guarantee the read-increment
// pair is atomic even if two admins click "assign" at the same instant — no
// two members can ever get the same number.
const COUNTER_DOC = doc(db, "config", "memberIdCounter");

export async function assignNextMemberId(uid) {
  const profileRef = doc(db, "profiles", uid);
  return runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(COUNTER_DOC);
    const next = (counterSnap.exists() ? counterSnap.data().next : 1) || 1;
    const memberId = `TSPP-${String(next).padStart(4, "0")}`;
    tx.set(COUNTER_DOC, { next: next + 1, updatedAt: serverTimestamp() }, { merge: true });
    tx.update(profileRef, { memberId, updatedAt: serverTimestamp() });
    return memberId;
  });
}
