import "server-only";

import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

/**
 * The Firebase service account, as the JSON of the key file downloaded from
 * Firebase console → Project settings → Service accounts. Server-only secret.
 */
function readServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) return null;
    return parsed as ServiceAccount;
  } catch {
    return null;
  }
}

export function isFirebaseAdminConfigured() {
  return readServiceAccount() !== null;
}

function getAdminApp(): App {
  if (getApps().length) return getApp();

  const account = readServiceAccount();
  if (!account) throw new Error("FIREBASE_SERVICE_ACCOUNT is not configured.");

  return initializeApp({
    credential: cert({
      projectId: account.project_id,
      clientEmail: account.client_email,
      privateKey: account.private_key,
    }),
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
