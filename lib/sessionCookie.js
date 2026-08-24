// Call right after a successful sign-in/sign-up so middleware.js has a
// cookie to check on subsequent requests. Throws if the server couldn't
// mint the cookie (e.g. FIREBASE_ADMIN_* env vars missing/invalid) — check
// this instead of assuming the redirect to /dashboard will work, since
// middleware.js will otherwise silently bounce the user straight back to
// /login with no visible error at all.
export async function syncSessionCookie(user) {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "সেশন তৈরি করা যায়নি। সার্ভার কনফিগারেশন পরীক্ষা করুন।");
  }
}

// Call right before firebase's signOut() so the cookie doesn't outlive the
// client-side session.
export async function clearSessionCookie() {
  await fetch("/api/session", { method: "DELETE" });
}