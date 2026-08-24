// Server-only — never import this from a "use client" file.
//
// This deliberately does NOT use the `firebase-admin` package. That package
// pulls in `jwks-rsa`, which depends on `jose` v6 (ESM-only, no CommonJS
// build) — a combination that reliably crashes with ERR_REQUIRE_ESM once
// bundled into a serverless function (confirmed on Netlify's Next.js
// runtime). We only need two things — verify an ID token, mint a session
// cookie — and both are just plain REST calls to Google's Identity Toolkit
// API. Implementing them directly here means zero dependency on any package
// that could reintroduce that class of bug: signing uses Node's built-in
// `crypto`, everything else is `fetch`.

import crypto from "crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const IDENTITY_TOOLKIT_URL = "https://identitytoolkit.googleapis.com/v1";
const SCOPE = "https://www.googleapis.com/auth/identitytoolkit";

function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function getCredentials() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  const missing = [
    !projectId && "FIREBASE_ADMIN_PROJECT_ID",
    !clientEmail && "FIREBASE_ADMIN_CLIENT_EMAIL",
    !privateKey && "FIREBASE_ADMIN_PRIVATE_KEY",
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(`Missing env var(s): ${missing.join(", ")}. Check your environment and redeploy/restart.`);
  }
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----") || !privateKey.includes("-----END PRIVATE KEY-----")) {
    throw new Error(
      "FIREBASE_ADMIN_PRIVATE_KEY doesn't look like a valid PEM key (missing BEGIN/END markers). " +
      "Copy it fresh from the service account JSON's \"private_key\" field, keep it on one line " +
      "with literal \\n, and wrap the whole value in double quotes."
    );
  }
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing env var: NEXT_PUBLIC_FIREBASE_API_KEY (needed to verify ID tokens).");
  }

  return { projectId, clientEmail, privateKey, apiKey };
}

// Signs a short-lived JWT assertion with the service account's private key
// (RS256, via Node's built-in crypto — no external JWT library) and
// exchanges it for a Google OAuth2 access token. Cached in module scope
// until shortly before it expires.
let cachedToken = null; // { accessToken, expiresAt }

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.accessToken;
  }

  const { clientEmail, privateKey } = getCredentials();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iss: clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));
  const signingInput = `${header}.${payload}`;
  const signature = base64url(crypto.createSign("RSA-SHA256").update(signingInput).sign(privateKey));
  const assertion = `${signingInput}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to get Google OAuth2 access token: ${await res.text()}`);
  }
  const data = await res.json();
  cachedToken = { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.accessToken;
}

// Verifies an ID token is genuine via Google's accounts:lookup endpoint
// (validated server-side by Google, not by local signature verification —
// this is what avoids needing any JWT/JWKS library at all). Throws if the
// token is missing/expired/invalid.
export async function verifyIdToken(idToken) {
  const { apiKey } = getCredentials();
  const res = await fetch(`${IDENTITY_TOOLKIT_URL}/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || "Invalid ID token");
  }
  const data = await res.json();
  const user = data.users?.[0];
  if (!user) throw new Error("Invalid ID token");
  return user; // { localId (uid), email, ... }
}

// Mints a Firebase session cookie via the same REST endpoint the
// firebase-admin SDK itself calls internally — this is not a workaround,
// it's the actual underlying API the SDK wraps.
export async function createSessionCookie(idToken, expiresInMs) {
  const { projectId } = getCredentials();
  const accessToken = await getAccessToken();

  const res = await fetch(`${IDENTITY_TOOLKIT_URL}/projects/${projectId}:createSessionCookie`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ idToken, validDuration: String(Math.floor(expiresInMs / 1000)) }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || "Failed to create session cookie");
  }
  const data = await res.json();
  return data.sessionCookie;
}