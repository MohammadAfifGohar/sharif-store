/**
 * Pure helpers for customer login, shared by the server session code, the
 * account page and tests. No secrets or server-only imports here.
 */

/** The verified identity we keep in the session cookie. */
export type SessionUser = {
  /** Firebase user id. */
  uid: string;
  /** Verified Indian mobile number as 10 digits (phone login), if any. */
  phone: string | null;
  /** Verified, lower-cased email (Google login), if any. */
  email: string | null;
  name: string | null;
  /** Linked WooCommerce customer id, when it could be created/found. */
  customerId: number | null;
};

/**
 * WooCommerce requires an email on every customer, but phone logins don't
 * have one. Use a placeholder on the reserved `.invalid` TLD (RFC 2606), so
 * nothing is ever delivered to it, and it's obvious in the WooCommerce admin.
 */
const PHONE_LOGIN_EMAIL_DOMAIN = "phone.invalid";

export function getPhoneLoginEmail(phone: string) {
  return `${phone}@${PHONE_LOGIN_EMAIL_DOMAIN}`;
}

export function isPhoneLoginEmail(email: string | null | undefined) {
  return Boolean(email?.toLowerCase().endsWith(`@${PHONE_LOGIN_EMAIL_DOMAIN}`));
}

export const SESSION_COOKIE = "sharif_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * Normalises an Indian mobile number to its 10 digits, accepting forms like
 * "+91 98765 43210", "09876543210" or "98765-43210". Returns null otherwise.
 */
export function normalizeIndianPhone(value: string | null | undefined) {
  if (!value) return null;

  const digits = value.replace(/\D/g, "");
  const local =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : digits;

  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

/**
 * An order belongs to the user when its billing phone or email matches an
 * identity the user has proven (OTP for phone, Google for email). This also
 * surfaces orders placed as a guest before the user ever logged in.
 */
export function orderBelongsToUser(
  billing: { phone?: string | null; email?: string | null },
  user: Pick<SessionUser, "phone" | "email">,
) {
  if (user.phone && normalizeIndianPhone(billing.phone) === user.phone) {
    return true;
  }

  return Boolean(
    user.email && billing.email?.trim().toLowerCase() === user.email,
  );
}

/**
 * Only allow redirects back to our own pages after login, never to another
 * site (`//evil.com`, `https://…`) or to the login page itself.
 */
export function getSafeRedirectPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }
  if (value.startsWith("/\\") || value.startsWith("/login")) return "/account";

  return value;
}
