/**
 * Branded account emails with a real button instead of a bare link. Pure
 * functions so they can be unit-tested; sending lives in the API routes.
 */

const BRAND_COLOR = "#e80071";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout({
  greeting,
  intro,
  buttonLabel,
  link,
  footnote,
}: {
  greeting: string;
  intro: string;
  buttonLabel: string;
  link: string;
  footnote: string;
}) {
  const href = escapeHtml(link);
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f6f6;">
<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;color:#1a1a1a;">
  <p style="font-size:18px;font-weight:bold;margin:0 0 24px;">The Sharif Store</p>
  <p style="font-size:16px;margin:0 0 12px;">${greeting}</p>
  <p style="font-size:15px;line-height:1.6;margin:0;">${intro}</p>
  <p style="text-align:center;margin:32px 0;">
    <a href="${href}" style="background:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 32px;border-radius:8px;display:inline-block;">${buttonLabel}</a>
  </p>
  <p style="font-size:13px;line-height:1.6;color:#666666;margin:0 0 16px;">${footnote}</p>
  <p style="font-size:12px;line-height:1.6;color:#999999;margin:0;">Button not working? Copy this link into your browser:<br><a href="${href}" style="color:#999999;word-break:break-all;">${href}</a></p>
</div>
</body></html>`;
}

export function buildVerificationEmail({ name, link }: { name: string | null; link: string }) {
  const greeting = name?.trim() ? `Hello ${escapeHtml(name.trim())},` : "Hello,";
  return {
    subject: "Verify your email for The Sharif Store",
    html: layout({
      greeting,
      intro: "Thanks for creating an account. Please confirm your email address to finish signing up.",
      buttonLabel: "Verify email",
      link,
      footnote: "If you didn't create this account, you can ignore this email.",
    }),
    text: `${name?.trim() ? `Hello ${name.trim()},` : "Hello,"}\n\nPlease confirm your email address for The Sharif Store:\n${link}\n\nIf you didn't create this account, you can ignore this email.`,
  };
}

export function buildPasswordResetEmail({ email, link }: { email: string; link: string }) {
  return {
    subject: "Reset your password for The Sharif Store",
    html: layout({
      greeting: "Hello,",
      intro: `We received a request to reset the password for your account (${escapeHtml(email)}).`,
      buttonLabel: "Reset password",
      link,
      footnote: "If you didn't ask for this, you can ignore this email. Your password won't change.",
    }),
    text: `Hello,\n\nReset the password for your The Sharif Store account (${email}):\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
  };
}
