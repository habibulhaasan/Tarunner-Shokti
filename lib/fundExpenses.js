"use client";

import { useEffect, useState } from "react";
import {
  collection, doc, addDoc, deleteDoc, onSnapshot,
  query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const EXPENSES_COL = collection(db, "fundExpenses");

export async function addExpense({ title, amount, category, note, date, createdBy }) {
  await addDoc(EXPENSES_COL, {
    title: title.trim(),
    amount: Number(amount),
    category: category || "General",
    note: (note || "").trim(),
    date: date || new Date().toISOString().slice(0, 10),
    createdBy,
    createdAt: serverTimestamp(),
  });
}

export async function deleteExpense(id) {
  await deleteDoc(doc(db, "fundExpenses", id));
}

// Read access is open to any signed-in member (not just admins) — the whole
// point of tracking expenses is so a donor can see exactly where the fund
// went, not just that some was spent. Only admins can write (see
// firestore.rules), so this is display-only for regular members.
export function useExpenses() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const q = query(EXPENSES_COL, orderBy("date", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setReady(true);
      },
      (err) => {
        console.error("fundExpenses listener error:", err);
        setReady(true);
      }
    );
    return () => unsub();
  }, []);

  return { items, ready };
}
