import { NextResponse } from "next/server";

import { buildVerificationEmail } from "@/lib/auth-emails";
import { getAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import {
  createRateLimiter,
  getClientIp,
  isAllowedOrigin,
  readJsonBody,
} from "@/lib/request-guards";

const MAX_BODY_SIZE = 8_000;
const isRateLimited = createRateLimiter(5, 60_000);

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

/**
 * Sends the branded "verify your email" message for the signed-in Firebase
 * user. Answers 503 when our own mail isn't set up, so the browser falls back
 * to Firebase's built-in email.
 */
export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) return error("Not allowed.", 403);
  if (!isFirebaseAdminConfigured() || !isMailerConfigured()) {
    return error("Custom email is not configured.", 503);
  }
  if (isRateLimited(getClientIp(request))) {
    return error("Too many attempts. Please wait a minute and try again.", 429);
  }

  const parsed = await readJsonBody(request, MAX_BODY_SIZE);
  const idToken =
    parsed.ok && typeof (parsed.body as { idToken?: unknown })?.idToken === "string"
      ? (parsed.body as { idToken: string }).idToken
      : null;
  if (!idToken) return error("Request could not be read.", 400);

  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(idToken);
  } catch {
    return error("Please log in again.", 401);
  }
  if (!decoded.email) return error("This account has no email.", 400);
  if (decoded.email_verified) return NextResponse.json({ ok: true });

  try {
    // isAllowedOrigin guarantees this is our own site (or localhost).
    const origin = request.headers.get("origin") as string;
    const link = await getAdminAuth().generateEmailVerificationLink(decoded.email, {
      url: `${origin}/login`,
    });
    await sendMail({
      to: decoded.email,
      ...buildVerificationEmail({
        name: typeof decoded.name === "string" ? decoded.name : null,
        link,
      }),
    });
  } catch (cause) {
    console.error("[auth] could not send verification email", cause);
    return error("We couldn't send the email. Please try again.", 502);
  }

  return NextResponse.json({ ok: true });
}
