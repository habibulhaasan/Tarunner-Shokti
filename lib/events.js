"use client";

import { useEffect, useState } from "react";
import {
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc, onSnapshot,
  query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const EVENTS_COL = collection(db, "events");

export async function createEvent({ title, description, location, startAt, endAt, visible, createdBy }) {
  await addDoc(EVENTS_COL, {
    title: title.trim(),
    description: (description || "").trim(),
    location: (location || "").trim(),
    startAt,
    endAt: endAt || null,
    visible: !!visible,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateEvent(id, patch) {
  await updateDoc(doc(db, "events", id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteEvent(id) {
  await deleteDoc(doc(db, "events", id));
}

export async function toggleEventVisibility(id, visible) {
  await updateEvent(id, { visible });
}

// Admin: every event, draft or published, soonest first.
export function useAllEvents() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const q = query(EVENTS_COL, orderBy("startAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReady(true);
    });
    return () => unsub();
  }, []);

  return { items, ready };
}

// Members: only published events.
export function useVisibleEvents() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const q = query(EVENTS_COL, where("visible", "==", true), orderBy("startAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReady(true);
    });
    return () => unsub();
  }, []);

  return { items, ready };
}

// The signed-in member's own RSVP for one event.
export function useMyRsvp(eventId, uid) {
  const [status, setStatus] = useState(null); // "going" | "not_going" | null (no answer yet)
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!eventId || !uid) return;
    const unsub = onSnapshot(
      doc(db, "events", eventId, "rsvps", uid),
      (snap) => {
        setStatus(snap.exists() ? snap.data().status : null);
        setReady(true);
      },
      () => setReady(true)
    );
    return () => unsub();
  }, [eventId, uid]);

  return { status, ready };
}

export async function setRsvp(eventId, uid, status) {
  await setDoc(doc(db, "events", eventId, "rsvps", uid), { status, updatedAt: serverTimestamp() });
}

// Admin: every RSVP for one event, for a headcount / attendee list.
export function useEventRsvps(eventId) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const unsub = onSnapshot(collection(db, "events", eventId, "rsvps"), (snap) => {
      setItems(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
      setReady(true);
    });
    return () => unsub();
  }, [eventId]);

  return { items, ready };
}
