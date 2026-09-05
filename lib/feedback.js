"use client";

import { useEffect, useState } from "react";
import {  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { sendNotification } from "./notifications";

const FEEDBACK_COL = collection(db, "feedback");
const PUBLIC_FEEDBACK_COL = collection(db, "publicFeedback");

export async function submitFeedback({ uid, message }) {
  await addDoc(FEEDBACK_COL, {
    uid,
    message: message.trim(),
    status: "open", // "open" | "reviewed"
    adminRemark: "",
    createdAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
  });
}

export function useMyFeedback(uid) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const q = query(FEEDBACK_COL, where("uid", "==", uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReady(true);
    });
    return () => unsub();
  }, [uid]);

  return { items, ready };
}

export function useAllFeedback() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const q = query(FEEDBACK_COL, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReady(true);
    });
    return () => unsub();
  }, []);

  return { items, ready };
}

export async function addFeedbackRemark({ feedbackItem, adminUid, remark }) {
  await updateDoc(doc(db, "feedback", feedbackItem.id), {
    status: "reviewed",
    adminRemark: remark.trim(),
    reviewedAt: serverTimestamp(),
    reviewedBy: adminUid,
  });
  await sendNotification({
    title: "Admin replied to your feedback",
    body: remark.trim(),
    audience: "user",
    targetUid: feedbackItem.uid,
    createdBy: adminUid,
  });
}

export async function submitPublicFeedback({ name, mobile, email, address, message }) {
  await addDoc(PUBLIC_FEEDBACK_COL, {
    name: name.trim(),
    mobile: mobile.trim(),
    email: (email || "").trim(),
    address: (address || "").trim(),
    message: message.trim(),
    status: "open", // "open" | "reviewed"
    adminNote: "",
    createdAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
  });
}

export function useAllPublicFeedback() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const q = query(PUBLIC_FEEDBACK_COL, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setReady(true);
      },
      (err) => {
        console.error("publicFeedback listener error:", err);
        setReady(true);
      }
    );
    return () => unsub();
  }, []);

  return { items, ready };
}

export async function updatePublicFeedbackStatus({ feedbackId, status, adminNote, adminUid }) {
  const payload = {
    status,
    adminNote: (adminNote || "").trim(),
    reviewedAt: serverTimestamp(),
    reviewedBy: adminUid,
  };
  await updateDoc(doc(db, "publicFeedback", feedbackId), payload);
}

export async function deletePublicFeedback(feedbackId) {
  await deleteDoc(doc(db, "publicFeedback", feedbackId));
}
