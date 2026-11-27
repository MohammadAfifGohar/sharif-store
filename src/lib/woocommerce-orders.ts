import "server-only";

import { orderBelongsToUser, type SessionUser } from "@/lib/auth";
import type { CheckoutRequest } from "@/lib/checkout";
import { quoteShipping, type ShippingRules } from "@/lib/shipping";
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
  /** Set by WooCommerce when the order is marked Completed (= delivered). UTC, no zone suffix. */
  date_completed_gmt?: string | null;
  transaction_id: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
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
    /** Before coupons. */
    subtotal: string;
    /** After coupons. */
    total: string;
    image?: { src?: string } | null;
  }>;
  fee_lines: Array<{ id: number; name: string; total: string }>;
  coupon_lines?: Array<{ id: number; code: string; discount: string }>;
  discount_total?: string;
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

export async function orderRequest<T>(
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
    payment_method: "razorpay",
    payment_method_title: "Razorpay (UPI, Cards, NetBanking, Wallets)",
  },
  cod: {
    payment_method: "cod",
    payment_method_title: "Cash on delivery",
  },
} as const;

/**
 * Creates the order. Only product IDs and quantities are sent — WooCommerce
 * prices the lines itself, so a tampered bag can't change totals.
 *
 * Shipping depends on those WooCommerce prices, so the order is created as
 * pending first and shipping is added once the lines are priced. It is set
 * server-side so the client can't change it.
 */
export async function createOrder(
  { customer, items, paymentMethod, couponCode }: CheckoutRequest,
  /** Logged-in customer's WooCommerce id; guests place orders without one. */
  customerId: number | null = null,
  {
    shipping,
    freeShippingCoupon = false,
  }: {
    /** Rules of the WooCommerce shipping zone for this address. */
    shipping: ShippingRules;
    /** Set when the (already checked) coupon allows free shipping. */
    freeShippingCoupon?: boolean;
  },
) {
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

  const order = await orderRequest<WooOrder>("orders", {
    method: "POST",
    body: {
      ...PAYMENT_METHOD_FIELDS[paymentMethod],
      status: "pending",
      set_paid: false,
      created_via: "headless-storefront",
      ...(customerId ? { customer_id: customerId } : {}),
      billing: { ...address, email: customer.email, phone: customer.phone },
      shipping: { ...address, phone: customer.phone },
      customer_note: customer.note,
      line_items: items.map((item) => ({
        product_id: item.productId,
        ...(item.variationId ? { variation_id: item.variationId } : {}),
        quantity: item.quantity,
      })),
      // WooCommerce applies the coupon to the lines itself.
      ...(couponCode ? { coupon_lines: [{ code: couponCode }] } : {}),
    },
  });

  if (
    couponCode &&
    !order.coupon_lines?.some((line) => line.code.toLowerCase() === couponCode)
  ) {
    await cancelOrder(order.id).catch(() => undefined);
    throw new WooOrderError(400, "coupon_not_applied", "The coupon could not be applied.");
  }

  // Line totals are after the coupon, so shipping is too.
  const subtotal = order.line_items.reduce((sum, line) => sum + Number(line.subtotal), 0);
  const itemsTotal = order.line_items.reduce((sum, line) => sum + Number(line.total), 0);
  const { fee: shippingFee, method: shippingMethod } = quoteShipping(shipping, {
    subtotal,
    itemsTotal,
    freeShippingCoupon,
  });
  // COD matches WooCommerce's own behaviour: the order goes straight to
  // processing (reducing stock and sending the order email) once fully priced.
  // Online orders stay pending until Razorpay confirms the payment.
  const status = paymentMethod === "cod" ? "processing" : null;
  if (!shippingMethod && !status) return order;

  try {
    // Changing shipping lines makes WooCommerce recalculate the total.
    const updated = await orderRequest<WooOrder>(`orders/${order.id}`, {
      method: "PUT",
      body: {
        ...(shippingMethod
          ? {
              // The WooCommerce shipping method that applies, so the order shows
              // "Flat rate" or "Free shipping" as configured in Settings → Shipping.
              shipping_lines: [
                {
                  method_id: shippingMethod.id,
                  instance_id: String(shippingMethod.instanceId),
                  method_title: shippingMethod.title,
                  total: shippingFee.toFixed(2),
                },
              ],
            }
          : {}),
        ...(status ? { status } : {}),
      },
    });
    if (Number(updated.shipping_total) !== shippingFee) {
      throw new Error(`Shipping was not applied to order ${order.id}`);
    }
    return updated;
  } catch (cause) {
    await cancelOrder(order.id).catch(() => undefined);
    throw cause;
  }
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

/** Statuses that are internal to WooCommerce and never shown to customers. */
const HIDDEN_ORDER_STATUSES = new Set(["checkout-draft", "trash"]);

/**
 * The logged-in customer's orders, newest first. WooCommerce's order search
 * covers billing phone and email, so this also finds orders placed as a guest
 * before the customer ever logged in; exact matching then drops fuzzy hits.
 */
export async function listOrdersForUser(user: SessionUser) {
  const terms = [user.phone, user.email].filter(
    (term): term is string => Boolean(term),
  );
  const query = "per_page=50&orderby=date&order=desc";
  const [linked, ...searched] = await Promise.all([
    user.customerId
      ? orderRequest<WooOrder[]>(`orders?customer=${user.customerId}&${query}`)
      : Promise.resolve([]),
    ...terms.map((term) =>
      orderRequest<WooOrder[]>(`orders?search=${encodeURIComponent(term)}&${query}`),
    ),
  ]);

  const byId = new Map<number, WooOrder>();
  const add = (order: WooOrder) => {
    if (!HIDDEN_ORDER_STATUSES.has(order.status)) byId.set(order.id, order);
  };
  // Orders linked to the customer account are theirs by definition.
  linked.forEach(add);
  searched
    .flat()
    .filter((order) => orderBelongsToUser(order.billing, user))
    .forEach(add);

  return [...byId.values()].sort((a, b) =>
    b.date_created.localeCompare(a.date_created),
  );
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
