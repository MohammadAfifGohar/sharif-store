import "server-only";

import { cache } from "react";

import {
  getCouponOffers,
  type CouponOffer,
  type WooCoupon,
} from "@/lib/coupons";
import { getWordpressUrl } from "@/lib/site-config";
import { getProductsByIds, type WooProduct } from "@/lib/woocommerce";

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Authenticated read against the WooCommerce admin REST API (`wc/v3`). Unlike
 * the public Store API, this exposes merchant-curated and computed data such as
 * up-sells and related products. Returns null when credentials are missing or
 * the request fails, so callers degrade gracefully instead of erroring.
 */
async function fetchAdminApi<T>(path: string): Promise<T | null> {
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) return null;

  try {
    const response = await fetch(`${getWordpressUrl()}/wp-json/wc/v3/${path}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${consumerKey}:${consumerSecret}`,
        ).toString("base64")}`,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: 300, tags: ["woocommerce"] },
    });

    if (!response.ok) return null;

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

type ProductRelations = {
  upsell_ids: number[];
  related_ids: number[];
};

/**
 * WooCommerce's own recommendations for the "similar products" block, in the
 * order WooCommerce intends them:
 *   1. Merchant-curated up-sells (`upsell_ids`) — the product page's purpose.
 *   2. WooCommerce's computed related products (`related_ids`, shared
 *      categories/tags) as a fallback when no up-sells are configured.
 *
 * IDs are hydrated through the Store API so cards render with identical
 * pricing, discounts and variants to the rest of the catalogue.
 */
export const getRelatedProducts = cache(
  async (product: WooProduct, limit = 4): Promise<WooProduct[]> => {
    const relations = await fetchAdminApi<ProductRelations>(
      `products/${product.id}?_fields=upsell_ids,related_ids`,
    );
    if (!relations) return [];

    const ids = (
      relations.upsell_ids.length > 0
        ? relations.upsell_ids
        : relations.related_ids
    ).slice(0, limit);

    return getProductsByIds(ids);
  },
);

/**
 * Coupons advertised in the announcement bar: the same `[show]` offers the bag
 * lists. Cached like the rest of the catalogue (5 minutes) so the header does
 * not turn every page into a per-request render.
 */
export const getAdvertisedCouponOffers = cache(
  async (): Promise<CouponOffer[]> => {
    const coupons = await fetchAdminApi<WooCoupon[]>(
      "coupons?per_page=100&orderby=date&order=desc",
    );
    return coupons ? getCouponOffers(coupons) : [];
  },
);
