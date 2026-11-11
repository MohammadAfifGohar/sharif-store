import { NextResponse } from "next/server";

import { isValidWebhookSignature } from "@/lib/razorpay-signature";
import {
  getLinkedRazorpayOrderId,
  getOrder,
  markOrderPaid,
} from "@/lib/woocommerce-orders";

type PaymentEntity = {
  id: string;
  order_id: string;
  status: string;
  notes?: Record<string, string> | unknown[];
};

type WebhookEvent = {
  event: string;
  payload?: { payment?: { entity?: PaymentEntity } };
};

const HANDLED_EVENTS = new Set(["payment.captured", "order.paid"]);

/**
 * Server-to-server fallback for when the customer pays but closes the tab
 * before the browser callback reaches `/api/checkout/verify`.
 *
 * Configure in Razorpay Dashboard → Webhooks:
 *   URL:    https://<site>/api/razorpay/webhook
 *   Events: payment.captured, order.paid
 *   Secret: same value as RAZORPAY_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false }, { status: 503 });

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!signature || !isValidWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(rawBody) as WebhookEvent;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const notes = payment?.notes && !Array.isArray(payment.notes) ? payment.notes : {};
  const wcOrderId = Number(notes.woocommerce_order_id);

  // Acknowledge events we don't act on (and payments not created by this
  // storefront) so Razorpay doesn't keep retrying them.
  if (
    !HANDLED_EVENTS.has(event.event) ||
    !payment ||
    payment.status !== "captured" ||
    !Number.isInteger(wcOrderId) ||
    wcOrderId <= 0
  ) {
    return NextResponse.json({ ok: true });
  }

  try {
    const order = await getOrder(wcOrderId);

    // Only orders this storefront linked to that exact Razorpay order.
    if (getLinkedRazorpayOrderId(order) !== payment.order_id) {
      return NextResponse.json({ ok: true });
    }

    await markOrderPaid(order, payment.id);
    return NextResponse.json({ ok: true });
  } catch (cause) {
    console.error("[razorpay/webhook] could not update order", cause);
    // Non-2xx makes Razorpay retry later.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
