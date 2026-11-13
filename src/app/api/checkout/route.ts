import { after, NextResponse } from "next/server";

import {
  checkoutRequestSchema,
  getOrderConfirmationPath,
  toMinorUnits,
  type CheckoutRequest,
  type CheckoutSession,
  type CodOrderResult,
} from "@/lib/checkout";
import { getSessionUser } from "@/lib/auth-session";
import { createRazorpayOrder, getRazorpayConfig } from "@/lib/razorpay";
import { saveCheckoutDetailsToCustomer } from "@/lib/woocommerce-customers";
import {
  createRateLimiter,
  getClientIp,
  isAllowedOrigin,
  readJsonBody,
} from "@/lib/request-guards";
import {
  attachRazorpayOrder,
  cancelOrder,
  createOrder,
  isWooOrdersConfigured,
  WooOrderError,
} from "@/lib/woocommerce-orders";

const MAX_BODY_SIZE = 20_000;
const isRateLimited = createRateLimiter(10, 60_000);

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function orderFailure(cause: unknown) {
  // WooCommerce rejects unknown/unpurchasable products with a 400.
  if (cause instanceof WooOrderError && cause.status === 400) {
    return error(
      "Some items in your bag are no longer available. Please review your bag.",
      409,
    );
  }

  return error("We couldn't place your order. Please try again.", 502);
}

/**
 * Remembers the checkout details on the logged-in customer's WooCommerce
 * profile for next time. Never blocks or fails the order.
 */
function rememberCustomerDetails(
  customerId: number | null,
  request: CheckoutRequest,
) {
  if (!customerId) return;
  // after(): runs once the response is sent, so it doesn't slow down checkout.
  after(() =>
    saveCheckoutDetailsToCustomer(customerId, request.customer).catch((cause) => {
      console.error("[checkout] could not save customer details", cause);
    }),
  );
}

/** Cash on Delivery: no payment step, the order is placed straight away. */
async function placeCodOrder(request: CheckoutRequest, customerId: number | null) {
  try {
    const order = await createOrder(request, customerId);
    rememberCustomerDetails(customerId, request);
    const body: CodOrderResult = {
      kind: "cod",
      redirectUrl: getOrderConfirmationPath(order.id, order.order_key),
    };
    return NextResponse.json(body, { status: 201 });
  } catch (cause) {
    console.error("[checkout] could not place COD order", cause);
    return orderFailure(cause);
  }
}

/**
 * Starts a payment: creates a pending WooCommerce order (WooCommerce prices
 * it), then a Razorpay order for exactly that total, and returns what the
 * browser needs to open Razorpay Checkout.
 */
export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) return error("Checkout was not allowed.", 403);
  if (isRateLimited(getClientIp(request))) {
    return error("Too many attempts. Please wait a minute and try again.", 429);
  }

  if (!isWooOrdersConfigured()) {
    return error("Checkout is not available right now.", 503);
  }

  const parsedBody = await readJsonBody(request, MAX_BODY_SIZE);
  if (!parsedBody.ok) return error("The order could not be read.", parsedBody.status);

  const result = checkoutRequestSchema.safeParse(parsedBody.body);
  if (!result.success) {
    return error(result.error.issues[0]?.message ?? "Invalid order details.", 400);
  }

  const customerId = (await getSessionUser())?.customerId ?? null;

  if (result.data.paymentMethod === "cod") {
    return placeCodOrder(result.data, customerId);
  }

  const razorpay = getRazorpayConfig();
  if (!razorpay) {
    return error("Online payment is not available right now. Please choose Cash on Delivery.", 503);
  }

  let wcOrderId: number | null = null;
  try {
    const order = await createOrder(result.data, customerId);
    wcOrderId = order.id;
    rememberCustomerDetails(customerId, result.data);

    const amount = toMinorUnits(order.total);
    if (!Number.isInteger(amount) || amount < 100) {
      // Razorpay's minimum is ₹1; a zero/NaN total means a product didn't price.
      throw new Error(`Unexpected order total "${order.total}"`);
    }

    const razorpayOrder = await createRazorpayOrder(razorpay, {
      amount,
      currency: order.currency,
      wcOrderId: order.id,
      wcOrderNumber: order.number,
    });
    await attachRazorpayOrder(order.id, razorpayOrder.id);

    const session: CheckoutSession = {
      kind: "razorpay",
      keyId: razorpay.keyId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      wcOrderId: order.id,
      orderKey: order.order_key,
    };

    return NextResponse.json(session, { status: 201 });
  } catch (cause) {
    console.error("[checkout] could not start payment", cause);

    if (wcOrderId !== null) {
      await cancelOrder(wcOrderId).catch(() => undefined);
    }

    return orderFailure(cause);
  }
}
