/**
 * Coupon rules, mirroring how WooCommerce applies the coupons a merchant sets
 * up under Marketing → Coupons. This drives the discount preview at checkout
 * and the server-side check before an order is placed; WooCommerce still
 * applies the coupon to the order itself, so its total is the final word.
 */

/** The coupon fields we read from the WooCommerce REST API (`wc/v3/coupons`). */
export type WooCoupon = {
  id: number;
  code: string;
  status: string;
  amount: string;
  discount_type: string;
  date_expires_gmt: string | null;
  usage_count: number;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  product_ids: number[];
  excluded_product_ids: number[];
  product_categories: number[];
  excluded_product_categories: number[];
  exclude_sale_items: boolean;
  minimum_amount: string;
  maximum_amount: string;
  free_shipping: boolean;
  description: string;
  email_restrictions: string[];
  used_by: Array<string | number>;
};

/** One bag line, priced from WooCommerce. */
export type CouponLine = {
  productId: number;
  variationId: number | null;
  categoryIds: number[];
  onSale: boolean;
  unitPrice: number;
  quantity: number;
};

export type CouponResult =
  | { ok: true; code: string; discount: number; freeShipping: boolean }
  | { ok: false; message: string };

const SUPPORTED_TYPES = new Set(["percent", "fixed_cart", "fixed_product"]);

/** A coupon the store advertises in the bag. */
export type CouponOffer = {
  code: string;
  title: string;
  minimumAmount: number;
};

/** Marker in a coupon's description that lists it as an offer in the bag. */
export const OFFER_MARKER = "[show]";

function describeCoupon(coupon: WooCoupon) {
  const amount = Number(coupon.amount) || 0;
  const parts: string[] = [];
  if (amount > 0) {
    if (coupon.discount_type === "percent") parts.push(`${amount}% off`);
    else if (coupon.discount_type === "fixed_product") parts.push(`${rupees(amount)} off each item`);
    else parts.push(`${rupees(amount)} off`);
  }
  if (coupon.free_shipping) parts.push("free shipping");
  const minimum = Number(coupon.minimum_amount) || 0;
  const text = parts.join(" + ") || "Special offer";
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}${
    minimum ? ` on orders of ${rupees(minimum)} or more` : ""
  }`;
}

/**
 * The coupons to advertise: published, still usable, open to everyone, and
 * marked with `[show]` in their description. The rest of the description, if
 * any, is shown as the offer's title.
 */
export function getCouponOffers(coupons: WooCoupon[], now = new Date()): CouponOffer[] {
  return coupons
    .filter(
      (coupon) =>
        coupon.status === "publish" &&
        SUPPORTED_TYPES.has(coupon.discount_type) &&
        coupon.description.toLowerCase().includes(OFFER_MARKER) &&
        !coupon.email_restrictions.length &&
        !(coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) &&
        !(coupon.date_expires_gmt && new Date(`${coupon.date_expires_gmt}Z`) <= now),
    )
    .map((coupon) => {
      const title = coupon.description.replace(/\[show\]/gi, "").replace(/\s+/g, " ").trim();
      return {
        code: normalizeCouponCode(coupon.code),
        title: title || describeCoupon(coupon),
        minimumAmount: Number(coupon.minimum_amount) || 0,
      };
    })
    .sort((a, b) => a.minimumAmount - b.minimumAmount);
}

export function normalizeCouponCode(code: string) {
  return code.trim().toLowerCase();
}

const rupees = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;
const roundMoney = (amount: number) => Math.round(amount * 100) / 100;

/** WooCommerce email restrictions allow `*` wildcards, e.g. `*@company.com`. */
function emailMatches(email: string, pattern: string) {
  const escaped = pattern
    .trim()
    .toLowerCase()
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`).test(email);
}

function isEligible(coupon: WooCoupon, line: CouponLine) {
  const ids = [line.productId, line.variationId].filter((id): id is number => id !== null);
  if (coupon.product_ids.length && !ids.some((id) => coupon.product_ids.includes(id))) {
    return false;
  }
  if (ids.some((id) => coupon.excluded_product_ids.includes(id))) return false;
  if (
    coupon.product_categories.length &&
    !line.categoryIds.some((id) => coupon.product_categories.includes(id))
  ) {
    return false;
  }
  if (line.categoryIds.some((id) => coupon.excluded_product_categories.includes(id))) {
    return false;
  }
  return !(coupon.exclude_sale_items && line.onSale);
}

export function evaluateCoupon(
  coupon: WooCoupon | null,
  lines: CouponLine[],
  { email, now = new Date() }: { email?: string; now?: Date } = {},
): CouponResult {
  const invalid = (message: string): CouponResult => ({ ok: false, message });

  if (!coupon || coupon.status !== "publish") {
    return invalid("This coupon code is not valid.");
  }
  if (!SUPPORTED_TYPES.has(coupon.discount_type)) {
    return invalid("This coupon can't be used on the website.");
  }
  if (coupon.date_expires_gmt && new Date(`${coupon.date_expires_gmt}Z`) <= now) {
    return invalid("This coupon has expired.");
  }
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return invalid("This coupon has reached its usage limit.");
  }

  // Without an email (a preview from the bag) these checks wait for checkout,
  // where the order is always checked with the customer's email.
  const normalizedEmail = email?.trim().toLowerCase();
  if (coupon.email_restrictions.length && normalizedEmail) {
    if (!coupon.email_restrictions.some((pattern) => emailMatches(normalizedEmail, pattern))) {
      return invalid("This coupon is not valid for your email address.");
    }
  }
  if (coupon.usage_limit_per_user && normalizedEmail) {
    const uses = coupon.used_by.filter(
      (entry) => String(entry).toLowerCase() === normalizedEmail,
    ).length;
    if (uses >= coupon.usage_limit_per_user) {
      return invalid("You have already used this coupon.");
    }
  }

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const minimum = Number(coupon.minimum_amount) || 0;
  const maximum = Number(coupon.maximum_amount) || 0;
  if (minimum && subtotal < minimum) {
    return invalid(`This coupon needs an order of ${rupees(minimum)} or more.`);
  }
  if (maximum && subtotal > maximum) {
    return invalid(`This coupon works on orders up to ${rupees(maximum)}.`);
  }

  const eligible = lines.filter((line) => isEligible(coupon, line));
  if (!eligible.length) {
    return invalid("This coupon doesn't apply to the items in your bag.");
  }

  const amount = Number(coupon.amount) || 0;
  const eligibleTotal = eligible.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  let discount: number;
  switch (coupon.discount_type) {
    case "percent":
      discount = eligible.reduce(
        (sum, line) => sum + roundMoney((line.unitPrice * line.quantity * amount) / 100),
        0,
      );
      break;
    case "fixed_product":
      discount = eligible.reduce(
        (sum, line) => sum + Math.min(amount, line.unitPrice) * line.quantity,
        0,
      );
      break;
    default:
      discount = amount;
  }
  discount = roundMoney(Math.min(discount, eligibleTotal));

  if (discount <= 0 && !coupon.free_shipping) {
    return invalid("This coupon doesn't apply to the items in your bag.");
  }

  return {
    ok: true,
    code: normalizeCouponCode(coupon.code),
    discount,
    freeShipping: coupon.free_shipping,
  };
}
