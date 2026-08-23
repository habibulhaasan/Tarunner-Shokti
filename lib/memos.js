"use client";

import { useEffect, useState } from "react";
import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, onSnapshot,
  query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const MEMOS_COL = collection(db, "memos");

export async function createMemo({ memoNo, title, content, date, visible, createdBy }) {
  await addDoc(MEMOS_COL, {
    memoNo: memoNo.trim(),
    title: title.trim(),
    content: content.trim(),
    date: date || new Date().toISOString().slice(0, 10),
    visible: !!visible,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateMemo(id, patch) {
  await updateDoc(doc(db, "memos", id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteMemo(id) {
  await deleteDoc(doc(db, "memos", id));
}

export async function toggleMemoVisibility(id, visible) {
  await updateMemo(id, { visible });
}

export async function getMemo(id) {
  const snap = await getDoc(doc(db, "memos", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Admin: every memo, draft or published, newest first.
export function useAllMemos() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const q = query(MEMOS_COL, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReady(true);
    });
    return () => unsub();
  }, []);

  return { items, ready };
}

// Members: only memos an admin has published.
export function useVisibleMemos() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const q = query(MEMOS_COL, where("visible", "==", true), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReady(true);
    });
    return () => unsub();
  }, []);

  return { items, ready };
}

// One memo, live — used by the print view. Admins can open any memo this
// way (draft or published); regular members are blocked from unpublished
// ones at the rules level, and this hook surfaces that as notFound so the
// print page can show a clean message instead of an infinite spinner.
export function useMemoDoc(id) {
  const [memo, setMemo] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(
      doc(db, "memos", id),
      (snap) => {
        if (snap.exists()) {
          setMemo({ id: snap.id, ...snap.data() });
        } else {
          setNotFound(true);
        }
        setReady(true);
      },
      () => {
        setNotFound(true);
        setReady(true);
      }
    );
    return () => unsub();
  }, [id]);

  return { memo, notFound, ready };
}
