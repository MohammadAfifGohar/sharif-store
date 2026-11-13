import "server-only";

import { randomBytes } from "node:crypto";

import { getPhoneLoginEmail, isPhoneLoginEmail, type SessionUser } from "@/lib/auth";
import type { CheckoutCustomer } from "@/lib/checkout";
import { orderRequest, WooOrderError } from "@/lib/woocommerce-orders";

type WooAddress = {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
};

export type WooCustomer = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  billing: WooAddress & { email: string };
  shipping: WooAddress;
};

/** `ph9876543210` for phone logins, `asha_4821` style for Google logins. */
function getCustomerUsername(user: SessionUser) {
  if (user.phone) return `ph${user.phone}`;

  const local = (user.email ?? "customer")
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 30);
  return `${local || "customer"}_${randomBytes(2).readUInt16BE(0) % 10000}`;
}

function splitName(name: string | null) {
  const [first = "", ...rest] = (name ?? "").trim().split(/\s+/);
  return { first_name: first, last_name: rest.join(" ") };
}

/**
 * Finds the WooCommerce customer for a logged-in user, creating one on first
 * login so every customer has a record in WooCommerce. Google logins are
 * keyed by their email; phone logins by a placeholder email derived from the
 * number (WooCommerce requires an email), with the number saved on billing.
 */
export async function findOrCreateWooCustomer(user: SessionUser) {
  const lookupEmail = user.email ?? (user.phone ? getPhoneLoginEmail(user.phone) : null);
  if (!lookupEmail) return null;

  const existing = await orderRequest<WooCustomer[]>(
    `customers?email=${encodeURIComponent(lookupEmail)}&role=all`,
  );
  if (existing[0]) return existing[0];

  const name = splitName(user.name);
  return orderRequest<WooCustomer>("customers", {
    method: "POST",
    body: {
      email: lookupEmail,
      // Sent explicitly because WooCommerce rejects customers without them
      // when "generate username/password" is off in its account settings.
      // Nobody uses the password: login is OTP / Google only.
      username: getCustomerUsername(user),
      password: randomBytes(24).toString("base64url"),
      ...name,
      billing: {
        ...name,
        ...(user.email ? { email: user.email } : {}),
        ...(user.phone ? { phone: user.phone } : {}),
        country: "IN",
      },
    },
  });
}

export function getWooCustomer(customerId: number) {
  return orderRequest<WooCustomer>(`customers/${customerId}`);
}

/**
 * Saves the details from a checkout onto the customer profile, so the next
 * checkout is pre-filled. A phone-login customer's placeholder email is
 * replaced by the real one they typed, unless another account already uses it.
 */
export async function saveCheckoutDetailsToCustomer(
  customerId: number,
  customer: CheckoutCustomer,
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
    phone: customer.phone,
  };
  const details = {
    first_name: customer.firstName,
    last_name: customer.lastName,
    billing: { ...address, email: customer.email },
    shipping: address,
  };

  const current = await getWooCustomer(customerId);
  if (!isPhoneLoginEmail(current.email)) {
    return orderRequest<WooCustomer>(`customers/${customerId}`, {
      method: "PUT",
      body: details,
    });
  }

  try {
    return await orderRequest<WooCustomer>(`customers/${customerId}`, {
      method: "PUT",
      body: { ...details, email: customer.email },
    });
  } catch (cause) {
    // Email already belongs to another WooCommerce account: keep the placeholder.
    if (cause instanceof WooOrderError && cause.status === 400) {
      return orderRequest<WooCustomer>(`customers/${customerId}`, {
        method: "PUT",
        body: details,
      });
    }
    throw cause;
  }
}

/** Checkout form defaults from the customer's saved WooCommerce profile. */
export function getCheckoutDefaults(
  customer: WooCustomer | null,
  user: SessionUser,
): Partial<CheckoutCustomer> {
  const billing = customer?.billing;
  const shipping = customer?.shipping;
  const name = splitName(user.name);
  const savedEmail = billing?.email || customer?.email || "";

  return {
    firstName: shipping?.first_name || billing?.first_name || name.first_name,
    lastName: shipping?.last_name || billing?.last_name || name.last_name,
    phone: shipping?.phone || billing?.phone || user.phone || "",
    email: (isPhoneLoginEmail(savedEmail) ? "" : savedEmail) || user.email || "",
    address1: shipping?.address_1 || "",
    address2: shipping?.address_2 || "",
    city: shipping?.city || "",
    state: shipping?.state || undefined,
    postcode: shipping?.postcode || "",
  };
}
