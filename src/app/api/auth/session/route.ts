import { NextResponse } from "next/server";

import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";
import {
  createSessionToken,
  isLoginConfigured,
  verifyFirebaseIdToken,
} from "@/lib/auth-session";
import {
  createRateLimiter,
  getClientIp,
  isAllowedOrigin,
  readJsonBody,
} from "@/lib/request-guards";
import { findOrCreateWooCustomer } from "@/lib/woocommerce-customers";

const MAX_BODY_SIZE = 8_000;
const isRateLimited = createRateLimiter(10, 60_000);

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

/** Exchanges a Firebase ID token for our own httpOnly session cookie. */
export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) return error("Login was not allowed.", 403);
  if (isRateLimited(getClientIp(request))) {
    return error("Too many attempts. Please wait a minute and try again.", 429);
  }
  if (!isLoginConfigured()) {
    return error("Login is not available right now.", 503);
  }

  const parsed = await readJsonBody(request, MAX_BODY_SIZE);
  const idToken =
    parsed.ok && typeof (parsed.body as { idToken?: unknown })?.idToken === "string"
      ? (parsed.body as { idToken: string }).idToken
      : null;
  if (!idToken) return error("Login could not be read.", 400);

  const verified = await verifyFirebaseIdToken(idToken);
  if (!verified) return error("We couldn't verify your login. Please try again.", 401);

  // Keep a customer record in WooCommerce. Login still works if WooCommerce
  // is briefly unreachable; orders then fall back to phone/email matching.
  const customer = await findOrCreateWooCustomer(verified).catch((cause) => {
    console.error("[auth] could not link WooCommerce customer", cause);
    return null;
  });
  const user = { ...verified, customerId: customer?.id ?? null };

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

/** Logs out by clearing the session cookie. */
export async function DELETE(request: Request) {
  if (!isAllowedOrigin(request)) return error("Logout was not allowed.", 403);

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
