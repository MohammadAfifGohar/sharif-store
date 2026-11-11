import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import {
  checkoutRequestSchema,
  getOrderConfirmationPath,
  toMinorUnits,
} from "../src/lib/checkout";
import {
  isValidPaymentSignature,
  isValidWebhookSignature,
} from "../src/lib/razorpay-signature";

const customer = {
  firstName: "Asha",
  lastName: "Patil",
  email: " Asha@Example.com ",
  phone: "+91 98765-43210",
  address1: "12 Old Sarafa",
  city: "Deglur",
  state: "MH",
  postcode: "431717",
};

test("normalises customer details and accepts a valid order", () => {
  const result = checkoutRequestSchema.safeParse({
    paymentMethod: "razorpay",
    customer,
    items: [{ productId: 10, variationId: null, quantity: 2 }],
  });

  assert.ok(result.success);
  assert.equal(result.data.customer.email, "asha@example.com");
  assert.equal(result.data.customer.phone, "9876543210");
  assert.equal(result.data.customer.address2, "");
});

test("rejects an empty bag, bad PIN code, unknown state and extra fields", () => {
  const base = { paymentMethod: "cod", customer, items: [{ productId: 1, variationId: null, quantity: 1 }] };

  assert.equal(checkoutRequestSchema.safeParse({ ...base, items: [] }).success, false);
  assert.equal(
    checkoutRequestSchema.safeParse({ ...base, customer: { ...customer, postcode: "04317" } }).success,
    false,
  );
  assert.equal(
    checkoutRequestSchema.safeParse({ ...base, customer: { ...customer, state: "XX" } }).success,
    false,
  );
  assert.equal(checkoutRequestSchema.safeParse({ ...base, total: 1 }).success, false);
});

test("converts WooCommerce totals to paise", () => {
  assert.equal(toMinorUnits("1297.00"), 129700);
  assert.equal(toMinorUnits("19.99"), 1999);
  assert.ok(Number.isNaN(toMinorUnits("abc")));
});

test("builds the order confirmation path", () => {
  assert.equal(
    getOrderConfirmationPath(42, "wc_order_abc"),
    "/order-confirmation?order=42&key=wc_order_abc",
  );
});

test("verifies Razorpay payment signatures", () => {
  const secret = "test_secret";
  const signature = createHmac("sha256", secret).update("order_1|pay_1").digest("hex");

  assert.equal(isValidPaymentSignature("order_1", "pay_1", signature, secret), true);
  assert.equal(isValidPaymentSignature("order_1", "pay_2", signature, secret), false);
  assert.equal(isValidPaymentSignature("order_1", "pay_1", "short", secret), false);
});

test("verifies Razorpay webhook signatures", () => {
  const secret = "whsec";
  const body = '{"event":"payment.captured"}';
  const signature = createHmac("sha256", secret).update(body).digest("hex");

  assert.equal(isValidWebhookSignature(body, signature, secret), true);
  assert.equal(isValidWebhookSignature(`${body} `, signature, secret), false);
});

test("requires a known payment method", () => {
  const order = { customer, items: [{ productId: 1, variationId: null, quantity: 1 }] };

  assert.equal(checkoutRequestSchema.safeParse({ ...order, paymentMethod: "cod" }).success, true);
  assert.equal(checkoutRequestSchema.safeParse({ ...order, paymentMethod: "paypal" }).success, false);
  assert.equal(checkoutRequestSchema.safeParse(order).success, false);
});
