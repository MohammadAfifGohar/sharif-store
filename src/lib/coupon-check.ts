import "server-only";

import type { CheckoutRequest } from "@/lib/checkout";
import {
  evaluateCoupon,
  getCouponOffers,
  normalizeCouponCode,
  type CouponLine,
  type CouponOffer,
  type CouponResult,
  type WooCoupon,
} from "@/lib/coupons";
import { getProductById, getProductsByIds, type WooProduct } from "@/lib/woocommerce";
import { orderRequest } from "@/lib/woocommerce-orders";

type CouponItem = CheckoutRequest["items"][number];

function unitPrice(product: WooProduct) {
  const amount = Number(product.prices.price) / 10 ** product.prices.currency_minor_unit;
  return Number.isFinite(amount) ? amount : 0;
}

async function findCoupon(code: string) {
  const coupons = await orderRequest<WooCoupon[]>(
    `coupons?code=${encodeURIComponent(code)}&per_page=1`,
  );
  return coupons.find((coupon) => normalizeCouponCode(coupon.code) === code) ?? null;
}

/** Prices the bag from WooCommerce so a coupon is never judged on browser prices. */
async function getCouponLines(items: CouponItem[]): Promise<CouponLine[] | null> {
  const parents = await getProductsByIds([...new Set(items.map((item) => item.productId))]);
  const byId = new Map(parents.map((product) => [product.id, product]));

  const lines = await Promise.all(
    items.map(async (item): Promise<CouponLine | null> => {
      const parent = byId.get(item.productId);
      if (!parent) return null;
      const priced = item.variationId
        ? await getProductById(item.variationId).catch(() => null)
        : parent;
      if (!priced) return null;

      return {
        productId: item.productId,
        variationId: item.variationId,
        categoryIds: parent.categories.map((category) => category.id),
        onSale: priced.on_sale,
        unitPrice: unitPrice(priced),
        quantity: item.quantity,
      };
    }),
  );

  return lines.every((line): line is CouponLine => line !== null) ? lines : null;
}

const OFFERS_TTL_MS = 5 * 60_000;
let offersCache: { at: number; offers: CouponOffer[] } | null = null;

/** Coupons marked `[show]` in WooCommerce, cached briefly. */
export async function listCouponOffers(): Promise<CouponOffer[]> {
  if (offersCache && Date.now() - offersCache.at < OFFERS_TTL_MS) return offersCache.offers;

  const coupons = await orderRequest<WooCoupon[]>("coupons?per_page=100&orderby=date&order=desc");
  const offers = getCouponOffers(coupons);
  offersCache = { at: Date.now(), offers };
  return offers;
}

/** Checks a coupon code against the bag and works out its discount. */
export async function checkCoupon(
  code: string,
  items: CouponItem[],
  email?: string,
): Promise<CouponResult> {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return { ok: false, message: "Enter a coupon code." };

  const [coupon, lines] = await Promise.all([findCoupon(normalized), getCouponLines(items)]);
  if (!lines) {
    return {
      ok: false,
      message: "Some items in your bag are no longer available. Please review your bag.",
    };
  }

  return evaluateCoupon(coupon, lines, { email });
}
