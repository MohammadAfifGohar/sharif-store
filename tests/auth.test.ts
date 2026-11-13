import assert from "node:assert/strict";
import test from "node:test";

import {
  getPhoneLoginEmail,
  getSafeRedirectPath,
  isPhoneLoginEmail,
  normalizeIndianPhone,
  orderBelongsToUser,
} from "../src/lib/auth";

test("normalizes Indian mobile numbers to 10 digits", () => {
  assert.equal(normalizeIndianPhone("+91 98765 43210"), "9876543210");
  assert.equal(normalizeIndianPhone("919876543210"), "9876543210");
  assert.equal(normalizeIndianPhone("09876543210"), "9876543210");
  assert.equal(normalizeIndianPhone("98765-43210"), "9876543210");
});

test("rejects numbers that are not Indian mobiles", () => {
  assert.equal(normalizeIndianPhone("12345"), null);
  assert.equal(normalizeIndianPhone("5876543210"), null);
  assert.equal(normalizeIndianPhone(""), null);
  assert.equal(normalizeIndianPhone(null), null);
});

test("matches orders by verified phone or email only", () => {
  const phoneUser = { phone: "9876543210", email: null };
  const emailUser = { phone: null, email: "asha@example.com" };

  assert.equal(orderBelongsToUser({ phone: "+91 98765 43210" }, phoneUser), true);
  assert.equal(orderBelongsToUser({ phone: "9876543211" }, phoneUser), false);
  assert.equal(orderBelongsToUser({ email: " Asha@Example.com " }, emailUser), true);
  assert.equal(orderBelongsToUser({ email: "other@example.com" }, emailUser), false);
  // An empty billing email must never match a phone-only user.
  assert.equal(orderBelongsToUser({ email: "" }, phoneUser), false);
});

test("only redirects back to our own pages after login", () => {
  assert.equal(getSafeRedirectPath("/checkout"), "/checkout");
  assert.equal(getSafeRedirectPath(null), "/account");
  assert.equal(getSafeRedirectPath("https://evil.example"), "/account");
  assert.equal(getSafeRedirectPath("//evil.example"), "/account");
  assert.equal(getSafeRedirectPath("/\\evil.example"), "/account");
  assert.equal(getSafeRedirectPath("/login?next=/x"), "/account");
});

test("phone logins get an undeliverable placeholder email", () => {
  const email = getPhoneLoginEmail("9876543210");
  assert.equal(email, "9876543210@phone.invalid");
  assert.equal(isPhoneLoginEmail(email), true);
  assert.equal(isPhoneLoginEmail("asha@example.com"), false);
});
