import { NextResponse } from "next/server";

import {
  getOrderConfirmationPath,
  paymentVerificationSchema,
} from "@/lib/checkout";
import { getRazorpayConfig } from "@/lib/razorpay";
import { isValidPaymentSignature } from "@/lib/razorpay-signature";
import {
  createRateLimiter,
  getClientIp,
  isAllowedOrigin,
  readJsonBody,
} from "@/lib/request-guards";
import {
  getLinkedRazorpayOrderId,
  getOrder,
  markOrderPaid,
} from "@/lib/woocommerce-orders";

const isRateLimited = createRateLimiter(20, 60_000);

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

/**
 * Called by the browser after Razorpay Checkout reports success. The signature
 * proves Razorpay issued this payment for this Razorpay order; the order meta
 * and order key prove that Razorpay order belongs to this WooCommerce order.
 */
export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) return error("Request was not allowed.", 403);
  if (isRateLimited(getClientIp(request))) return error("Too many requests.", 429);

  const razorpay = getRazorpayConfig();
  if (!razorpay) return error("Online payment is not available right now.", 503);

  const parsedBody = await readJsonBody(request, 2_000);
  if (!parsedBody.ok) return error("The payment details could not be read.", parsedBody.status);

  const result = paymentVerificationSchema.safeParse(parsedBody.body);
  if (!result.success) return error("Invalid payment details.", 400);

  const payment = result.data;

  if (
    !isValidPaymentSignature(
      payment.razorpayOrderId,
      payment.razorpayPaymentId,
      payment.razorpaySignature,
      razorpay.keySecret,
    )
  ) {
    return error("Payment could not be verified.", 400);
  }

  try {
    const order = await getOrder(payment.wcOrderId);

    if (
      order.order_key !== payment.orderKey ||
      getLinkedRazorpayOrderId(order) !== payment.razorpayOrderId
    ) {
      return error("Payment could not be verified.", 400);
    }

    await markOrderPaid(order, payment.razorpayPaymentId);

    return NextResponse.json({
      redirectUrl: getOrderConfirmationPath(order.id, order.order_key),
    });
  } catch (cause) {
    console.error("[checkout/verify] could not confirm order", cause);
    // The payment itself succeeded; the webhook will still mark the order paid.
    return error(
      "Your payment was received but we couldn't confirm the order yet. Please don't pay again — we'll contact you shortly.",
      502,
    );
  }
}
