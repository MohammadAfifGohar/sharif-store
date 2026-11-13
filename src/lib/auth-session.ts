import "server-only";

import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";

import {
  normalizeIndianPhone,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  type SessionUser,
} from "@/lib/auth";

/** Google's public keys for Firebase Auth ID tokens. jose caches them. */
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

function getFirebaseProjectId() {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null;
}

function getSessionKey() {
  const secret = process.env.AUTH_SESSION_SECRET;
  // A short secret would make the session cookie forgeable.
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export function isLoginConfigured() {
  return getFirebaseProjectId() !== null && getSessionKey() !== null;
}

/**
 * Verifies a Firebase ID token from the browser and returns the identity it
 * proves. Email is only trusted when Google marked it verified.
 */
export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<SessionUser | null> {
  const projectId = getFirebaseProjectId();
  if (!projectId) return null;

  try {
    const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ["RS256"],
    });

    if (typeof payload.sub !== "string" || payload.sub.length === 0) {
      return null;
    }

    const email =
      payload.email_verified === true && typeof payload.email === "string"
        ? payload.email.trim().toLowerCase()
        : null;
    const phone = normalizeIndianPhone(
      typeof payload.phone_number === "string" ? payload.phone_number : null,
    );
    if (!email && !phone) return null;

    return {
      uid: payload.sub,
      email,
      phone,
      name: typeof payload.name === "string" ? payload.name : null,
      customerId: null,
    };
  } catch {
    return null;
  }
}

export async function createSessionToken(user: SessionUser) {
  const key = getSessionKey();
  if (!key) throw new Error("AUTH_SESSION_SECRET is not configured.");

  return new SignJWT({
    phone: user.phone,
    email: user.email,
    name: user.name,
    customerId: user.customerId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.uid)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(key);
}

async function readSessionToken(token: string): Promise<SessionUser | null> {
  const key = getSessionKey();
  if (!key) return null;

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;

    return {
      uid: payload.sub,
      phone: typeof payload.phone === "string" ? payload.phone : null,
      email: typeof payload.email === "string" ? payload.email : null,
      name: typeof payload.name === "string" ? payload.name : null,
      customerId:
        typeof payload.customerId === "number" ? payload.customerId : null,
    };
  } catch {
    return null;
  }
}

/** The logged-in customer for the current request, or null. */
export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? readSessionToken(token) : null;
}
