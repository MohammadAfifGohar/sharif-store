/**
 * Shipping as configured in WooCommerce (Settings → Shipping): the zone that
 * matches the delivery address, and that zone's Flat rate and Free shipping
 * methods. Pure functions so the bag, checkout and order all agree.
 */

export type ShippingRules = {
  /** WooCommerce zone the rules came from (null for the built-in fallback). */
  zoneId: number | null;
  flatRate: { instanceId: number; title: string; cost: number } | null;
  freeShipping: {
    instanceId: number;
    title: string;
    /** WooCommerce's "Free shipping requires…": "", coupon, min_amount, either, both. */
    requires: string;
    minAmount: number;
    /** "Apply minimum order rule before coupon discount". */
    ignoreDiscounts: boolean;
  } | null;
};

/** Used only if WooCommerce can't be reached, so checkout never breaks. */
export const FALLBACK_SHIPPING_RULES: ShippingRules = {
  zoneId: null,
  flatRate: { instanceId: 0, title: "Shipping", cost: 59 },
  freeShipping: {
    instanceId: 0,
    title: "Free shipping",
    requires: "min_amount",
    minAmount: 499,
    ignoreDiscounts: false,
  },
};

export type ShippingQuote = {
  fee: number;
  method: { id: "flat_rate" | "free_shipping"; instanceId: number; title: string } | null;
};

/**
 * What shipping costs for an order, the way WooCommerce decides it: free
 * shipping when its requirement is met, otherwise the flat rate.
 */
export function quoteShipping(
  rules: ShippingRules,
  {
    subtotal,
    itemsTotal,
    freeShippingCoupon = false,
  }: {
    /** Items total before any coupon. */
    subtotal: number;
    /** Items total after the coupon. */
    itemsTotal: number;
    freeShippingCoupon?: boolean;
  },
): ShippingQuote {
  const free = rules.freeShipping;
  if (free) {
    const amount = free.ignoreDiscounts ? subtotal : itemsTotal;
    const meetsMinimum = amount >= free.minAmount;
    const qualifies =
      free.requires === "" ||
      (free.requires === "coupon" && freeShippingCoupon) ||
      (free.requires === "min_amount" && meetsMinimum) ||
      (free.requires === "either" && (freeShippingCoupon || meetsMinimum)) ||
      (free.requires === "both" && freeShippingCoupon && meetsMinimum);
    if (qualifies) {
      return { fee: 0, method: { id: "free_shipping", instanceId: free.instanceId, title: free.title } };
    }
  }
  if (rules.flatRate) {
    const { instanceId, title, cost } = rules.flatRate;
    return { fee: cost, method: { id: "flat_rate", instanceId, title } };
  }
  return { fee: 0, method: null };
}

/**
 * The order amount that unlocks free shipping, when that depends only on the
 * amount (for the "Add ₹X more" nudge); null when it doesn't.
 */
export function getFreeShippingThreshold(rules: ShippingRules) {
  const free = rules.freeShipping;
  return free && (free.requires === "min_amount" || free.requires === "either")
    ? free.minAmount
    : null;
}

/** The shipping rules in words, for the Terms & Conditions page. */
export function describeShipping(rules: ShippingRules) {
  const rupees = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
  const free = rules.freeShipping;
  const flat = rules.flatRate;
  const threshold = getFreeShippingThreshold(rules);
  const viaCoupon = free && ["coupon", "either", "both"].includes(free.requires);

  if (free?.requires === "") return "Shipping is free on all orders placed on this website.";

  let text: string;
  if (flat && flat.cost > 0 && threshold !== null) {
    text = `For orders placed on this website, shipping is free when your items total ${rupees(threshold)} or more${
      free?.ignoreDiscounts ? "" : " after any coupon discount"
    }. Smaller orders carry a shipping charge of ${rupees(flat.cost)}, which is shown in the order total before you place the order.`;
  } else if (flat && flat.cost > 0) {
    text = `Orders placed on this website carry a shipping charge of ${rupees(flat.cost)}, which is shown in the order total before you place the order.`;
  } else {
    text = "Shipping charges, if any, are shown in the order total before you place the order.";
  }
  return viaCoupon ? `${text} Free-shipping coupons, where offered, waive this charge.` : text;
}

export type ZoneLocation = { code: string; type: string };
export type ShippingZone = {
  id: number;
  order: number;
  locations: ZoneLocation[];
  rules: ShippingRules;
};

function postcodeMatches(postcode: string, pattern: string) {
  const value = pattern.trim().toUpperCase();
  if (value.includes("...")) {
    const [from, to] = value.split("...").map(Number);
    const code = Number(postcode);
    return code >= from && code <= to;
  }
  if (value.endsWith("*")) return postcode.startsWith(value.slice(0, -1));
  return postcode === value;
}

function zoneMatches(zone: ShippingZone, state?: string, postcode?: string) {
  if (!zone.locations.length) return false;
  const regions = zone.locations.filter((location) => location.type !== "postcode");
  const postcodes = zone.locations.filter((location) => location.type === "postcode");

  const regionOk =
    !regions.length ||
    regions.some(
      (location) =>
        (location.type === "country" && location.code === "IN") ||
        (location.type === "continent" && location.code === "AS") ||
        (location.type === "state" && Boolean(state) && location.code === `IN:${state}`),
    );
  const postcodeOk =
    !postcodes.length ||
    (Boolean(postcode) &&
      postcodes.some((location) => postcodeMatches(postcode as string, location.code)));

  return regionOk && postcodeOk;
}

/**
 * The first zone (in WooCommerce's order) covering the address, else the
 * "Locations not covered by your other zones" zone (id 0). Without a PIN code
 * (the bag), zones limited to PIN codes are skipped.
 */
export function pickShippingRules(
  zones: ShippingZone[],
  { state, postcode }: { state?: string; postcode?: string } = {},
): ShippingRules {
  const sorted = [...zones].sort((a, b) => a.order - b.order || a.id - b.id);
  const match =
    sorted.find((zone) => zone.id !== 0 && zoneMatches(zone, state, postcode)) ??
    sorted.find((zone) => zone.id === 0);
  return match?.rules ?? FALLBACK_SHIPPING_RULES;
}

type WooMethod = {
  instance_id: number;
  method_id: string;
  title: string;
  enabled: boolean;
  order: number;
  settings?: Record<string, { value?: unknown } | undefined>;
};

const setting = (method: WooMethod, key: string) =>
  String(method.settings?.[key]?.value ?? "").trim();

/** Turns a zone's WooCommerce shipping methods into rules. */
export function rulesFromMethods(zoneId: number, methods: WooMethod[]): ShippingRules {
  const enabled = methods.filter((method) => method.enabled).sort((a, b) => a.order - b.order);
  const flat = enabled.find((method) => method.method_id === "flat_rate");
  const free = enabled.find((method) => method.method_id === "free_shipping");
  // Only plain amounts are supported; a formula such as "[qty] * 10" can't be priced here.
  const flatCost = flat ? Number(setting(flat, "cost") || 0) : NaN;

  return {
    zoneId,
    flatRate:
      flat && Number.isFinite(flatCost)
        ? { instanceId: flat.instance_id, title: setting(flat, "title") || flat.title, cost: flatCost }
        : null,
    freeShipping: free
      ? {
          instanceId: free.instance_id,
          title: setting(free, "title") || free.title,
          requires: setting(free, "requires"),
          minAmount: Number(setting(free, "min_amount")) || 0,
          ignoreDiscounts: setting(free, "ignore_discounts") === "yes",
        }
      : null,
  };
}
