import { NextResponse } from "next/server";
import { z } from "zod";

import { buildPasswordResetEmail } from "@/lib/auth-emails";
import { getAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import {
  createRateLimiter,
  getClientIp,
  isAllowedOrigin,
  readJsonBody,
} from "@/lib/request-guards";

const MAX_BODY_SIZE = 2_000;
const isRateLimited = createRateLimiter(5, 60_000);
const bodySchema = z.object({ email: z.email().max(254) });

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

/**
 * Sends the branded password reset message. Always answers the same way
 * whether or not an account exists, so the form can't be used to discover
 * who has an account. Answers 503 when our own mail isn't set up, so the
 * browser falls back to Firebase's built-in email.
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
  const result = parsed.ok ? bodySchema.safeParse(parsed.body) : null;
  if (!result?.success) return error("Enter a valid email address.", 400);
  const email = result.data.email.trim().toLowerCase();

  try {
    // isAllowedOrigin guarantees this is our own site (or localhost).
    const origin = request.headers.get("origin") as string;
    const link = await getAdminAuth().generatePasswordResetLink(email, {
      url: `${origin}/login`,
    });
    await sendMail({ to: email, ...buildPasswordResetEmail({ email, link }) });
  } catch (cause) {
    const code = (cause as { code?: string })?.code;
    if (code !== "auth/user-not-found" && code !== "auth/email-not-found") {
      console.error("[auth] could not send password reset email", cause);
      return error("We couldn't send the email. Please try again.", 502);
    }
  }

  return NextResponse.json({ ok: true });
}
