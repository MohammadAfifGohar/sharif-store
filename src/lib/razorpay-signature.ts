import { createHmac, timingSafeEqual } from "node:crypto";

function safeEqualHex(expected: string, received: string) {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received.toLowerCase(), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Razorpay Checkout success signature:
 * HMAC_SHA256(`${razorpay_order_id}|${razorpay_payment_id}`, key_secret).
 */
export function isValidPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
  keySecret: string,
) {
  const expected = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return safeEqualHex(expected, signature);
}

/** Webhook signature: HMAC_SHA256(raw request body, webhook secret). */
export function isValidWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string,
) {
  const expected = createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  return safeEqualHex(expected, signature);
}
