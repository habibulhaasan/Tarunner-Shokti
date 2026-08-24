// Server-only — never import this from a "use client" file or it'll try to
// bundle firebase-admin (and your service account key) into client JS.
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminAuthInstance = null;
let initError = null;

function getAdminAuth() {
  if (adminAuthInstance) return adminAuthInstance;
  if (initError) throw initError;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  const missing = [
    !projectId && "FIREBASE_ADMIN_PROJECT_ID",
    !clientEmail && "FIREBASE_ADMIN_CLIENT_EMAIL",
    !privateKey && "FIREBASE_ADMIN_PRIVATE_KEY",
  ].filter(Boolean);

  if (missing.length) {
    initError = new Error(`Missing env var(s): ${missing.join(", ")}. Check .env.local and restart the dev server.`);
    throw initError;
  }

  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----") || !privateKey.includes("-----END PRIVATE KEY-----")) {
    initError = new Error(
      "FIREBASE_ADMIN_PRIVATE_KEY doesn't look like a valid PEM key (missing BEGIN/END markers). " +
      "Copy it fresh from the service account JSON's \"private_key\" field, keep it on one line " +
      "with literal \\n, and wrap the whole value in double quotes in .env.local."
    );
    throw initError;
  }

  try {
    const adminApp = getApps().length ? getApps()[0] : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    adminAuthInstance = getAuth(adminApp);
    return adminAuthInstance;
  } catch (err) {
    initError = err;
    throw err;
  }
}

export { getAdminAuth };