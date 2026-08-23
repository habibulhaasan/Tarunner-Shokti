// Server-only — never import this from a "use client" file or it'll try to
// bundle firebase-admin (and your service account key) into client JS.
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
// Service account keys come with literal "\n" sequences when pasted into a
// single-line env var — this turns them back into real newlines.
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

// A malformed private key here doesn't throw a clear error later — it makes
// firebase-admin fail deep inside its own signing code with a confusing
// "Cannot read properties of undefined (reading 'then')" the first time you
// call something that actually needs to sign a request (createSessionCookie,
// createCustomToken, etc.) rather than just read public certs (verifyIdToken).
// Catching the obvious formatting mistakes here up front saves that detour.
if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "[firebaseAdmin] Missing env var(s):",
    [
      !projectId && "FIREBASE_ADMIN_PROJECT_ID",
      !clientEmail && "FIREBASE_ADMIN_CLIENT_EMAIL",
      !privateKey && "FIREBASE_ADMIN_PRIVATE_KEY",
    ].filter(Boolean).join(", ")
  );
} else if (!privateKey.includes("-----BEGIN PRIVATE KEY-----") || !privateKey.includes("-----END PRIVATE KEY-----")) {
  console.error(
    "[firebaseAdmin] FIREBASE_ADMIN_PRIVATE_KEY doesn't look like a valid PEM key " +
    "(missing BEGIN/END markers). Likely it got double-escaped, truncated, or quoted " +
    "wrong when pasted into .env.local — copy it fresh from the downloaded service " +
    "account JSON's \"private_key\" field, keep it on one line with literal \\n, and " +
    "wrap the whole value in double quotes."
  );
}

const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });

export const adminAuth = getAuth(adminApp);