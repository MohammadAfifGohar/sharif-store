import assert from "node:assert/strict";
import test from "node:test";

import { buildPasswordResetEmail, buildVerificationEmail } from "../src/lib/auth-emails";

const link = "https://sharif-store-ccd99.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=abc&apiKey=k";

test("verification email has a button pointing at the link", () => {
  const email = buildVerificationEmail({ name: "Asha", link });

  assert.match(email.html, />Verify email<\/a>/);
  assert.ok(email.html.includes(`href="${link.replace(/&/g, "&amp;")}"`));
  assert.match(email.html, /Hello Asha,/);
  assert.ok(email.text.includes(link));
});

test("customer-supplied names are escaped, not rendered as HTML", () => {
  const email = buildVerificationEmail({ name: `<a href="https://evil.example">x</a>`, link });

  assert.ok(!email.html.includes("evil.example\">x</a>"));
  assert.match(email.html, /&lt;a href=/);
});

test("verification email without a name still greets politely", () => {
  assert.match(buildVerificationEmail({ name: null, link }).html, /Hello,/);
  assert.match(buildVerificationEmail({ name: "   ", link }).html, /Hello,/);
});

test("password reset email has a reset button and the account email", () => {
  const email = buildPasswordResetEmail({ email: "asha@example.com", link });

  assert.match(email.html, />Reset password<\/a>/);
  assert.match(email.html, /asha@example\.com/);
  assert.match(email.subject, /Reset your password/);
});
