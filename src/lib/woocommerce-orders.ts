import "server-only";

import type { CheckoutRequest } from "@/lib/checkout";
import { getWordpressUrl } from "@/lib/site-config";

const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Order meta key linking a WooCommerce order to the Razorpay order created for
 * it. Deliberately not `_`-prefixed: WooCommerce hides protected meta from the
 * REST API, and we need to read it back when verifying a payment.
 */
export const RAZORPAY_ORDER_META_KEY = "headless_razorpay_order_id";

/** Statuses that mean the order has already been paid for. */
const PAID_STATUSES = new Set(["processing", "completed", "on-hold"]);

export type WooOrder = {
  id: number;
  number: string;
  order_key: string;
  status: string;
  payment_method: string;
  currency: string;
  total: string;
  shipping_total: string;
  date_created: string;
  transaction_id: string;
  billing: { first_name: string; last_name: string; email: string; phone: string };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
    total: string;
    image?: { src?: string } | null;
  }>;
  meta_data: Array<{ key: string; value: unknown }>;
};

export class WooOrderError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = "WooOrderError";
  }
}

function getAuthHeader() {
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) return null;

  return `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`;
}

export function isWooOrdersConfigured() {
  return getAuthHeader() !== null;
}

async function orderRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const auth = getAuthHeader();
  if (!auth) throw new WooOrderError(503, undefined, "WooCommerce is not configured.");

  const response = await fetch(`${getWordpressUrl()}/wp-json/wc/v3/${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: auth,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const data = (await response.json().catch(() => null)) as
    | (T & { code?: string; message?: string })
    | null;

  if (!response.ok || !data) {
    throw new WooOrderError(
      response.status,
      data?.code,
      data?.message ?? `WooCommerce request failed with ${response.status}`,
    );
  }

  return data;
}

const PAYMENT_METHOD_FIELDS = {
  razorpay: {
    // Unpaid until Razorpay confirms the payment.
    status: "pending",
    payment_method: "razorpay",
    payment_method_title: "Razorpay (UPI, Cards, NetBanking, Wallets)",
  },
  cod: {
    // Matches WooCommerce's own COD behaviour: placed orders go straight to
    // processing (which also reduces stock); payment is collected on delivery.
    status: "processing",
    payment_method: "cod",
    payment_method_title: "Cash on delivery",
  },
} as const;

/**
 * Creates the order. Only product IDs and quantities are sent — WooCommerce
 * prices the lines itself, so a tampered bag can't change totals.
 */
export function createOrder({ customer, items, paymentMethod }: CheckoutRequest) {
  const address = {
    first_name: customer.firstName,
    last_name: customer.lastName,
    address_1: customer.address1,
    address_2: customer.address2,
    city: customer.city,
    state: customer.state,
    postcode: customer.postcode,
    country: "IN",
  };

  return orderRequest<WooOrder>("orders", {
    method: "POST",
    body: {
      ...PAYMENT_METHOD_FIELDS[paymentMethod],
      set_paid: false,
      created_via: "headless-storefront",
      billing: { ...address, email: customer.email, phone: customer.phone },
      shipping: { ...address, phone: customer.phone },
      customer_note: customer.note,
      line_items: items.map((item) => ({
        product_id: item.productId,
        ...(item.variationId ? { variation_id: item.variationId } : {}),
        quantity: item.quantity,
      })),
    },
  });
}

export function getOrder(orderId: number) {
  return orderRequest<WooOrder>(`orders/${orderId}`);
}

export function attachRazorpayOrder(orderId: number, razorpayOrderId: string) {
  return orderRequest<WooOrder>(`orders/${orderId}`, {
    method: "PUT",
    body: { meta_data: [{ key: RAZORPAY_ORDER_META_KEY, value: razorpayOrderId }] },
  });
}

export function cancelOrder(orderId: number) {
  return orderRequest<WooOrder>(`orders/${orderId}`, {
    method: "PUT",
    body: { status: "cancelled" },
  });
}

export function getLinkedRazorpayOrderId(order: WooOrder) {
  const meta = order.meta_data.find((entry) => entry.key === RAZORPAY_ORDER_META_KEY);
  return typeof meta?.value === "string" ? meta.value : null;
}

export function isOrderPaid(order: WooOrder) {
  return PAID_STATUSES.has(order.status);
}

/**
 * Marks the order paid (moves it to "processing", reduces stock, sends the
 * customer email). Idempotent: an already-paid order is returned unchanged, so
 * the browser callback and the webhook can both safely call this.
 */
export async function markOrderPaid(order: WooOrder, razorpayPaymentId: string) {
  if (isOrderPaid(order)) return order;

  const updated = await orderRequest<WooOrder>(`orders/${order.id}`, {
    method: "PUT",
    body: { set_paid: true, transaction_id: razorpayPaymentId },
  });

  await orderRequest(`orders/${order.id}/notes`, {
    method: "POST",
    body: { note: `Razorpay payment successful. Payment ID: ${razorpayPaymentId}` },
  }).catch(() => undefined);

  return updated;
}
