import { cache } from "react";

import { getWordpressUrl } from "@/lib/site-config";

/** Abort a WooCommerce request that hasn't responded within this window. */
const REQUEST_TIMEOUT_MS = 10_000;

export class WooCommerceError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`WooCommerce request to "${path}" failed with ${status}`);
    this.name = "WooCommerceError";
  }
}

export type WooImage = {
  id: number;
  src: string;
  thumbnail: string;
  srcset?: string;
  sizes?: string;
  name?: string;
  alt: string;
};

export type WooTerm = {
  id: number;
  name: string;
  slug: string;
  link?: string;
};

export type WooAttribute = {
  id: number;
  name: string;
  taxonomy?: string | null;
  has_variations?: boolean;
  terms: Array<{ id: number; name: string; slug: string }>;
};

export type WooDimensions = {
  length: string;
  width: string;
  height: string;
};

export type WooStockAvailability = {
  text: string;
  class: string;
};

export type WooCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  permalink: string;
  image: WooImage | null;
};

export type WooProductReview = {
  id: number;
  formatted_date_created: string;
  product_id: number;
  reviewer: string;
  review: string;
  rating: number;
  verified: boolean;
};

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  sku?: string;
  short_description?: string;
  description?: string;
  type: "simple" | "variable" | string;
  variation?: string;
  on_sale: boolean;
  average_rating: string;
  review_count: number;
  images: WooImage[];
  categories: Array<Pick<WooCategory, "id" | "name" | "slug"> & { link?: string }>;
  tags: WooTerm[];
  brands: WooTerm[];
  attributes: WooAttribute[];
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    price_range: {
      min_amount: string;
      max_amount: string;
    } | null;
  };
  weight?: string;
  dimensions?: WooDimensions;
  formatted_weight?: string;
  formatted_dimensions?: string;
  stock_availability?: WooStockAvailability;
  low_stock_remaining?: number | null;
  is_purchasable?: boolean;
  is_in_stock: boolean;
  is_on_backorder?: boolean;
  sold_individually?: boolean;
  has_options: boolean;
};

async function fetchStoreApi<T>(path: string): Promise<T> {
  const response = await fetch(
    `${getWordpressUrl()}/wp-json/wc/store/v1/${path}`,
    {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: {
        revalidate: 300,
        tags: ["woocommerce"],
      },
    },
  );

  if (!response.ok) {
    throw new WooCommerceError(response.status, path);
  }

  return response.json() as Promise<T>;
}

export const getStoreCategories = cache(async () =>
  fetchStoreApi<WooCategory[]>(
    "products/categories?hide_empty=false&per_page=100",
  ),
);

export const getCategoryPageData = cache(async (slug: string) => {
  const categories = await getStoreCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return null;
  }

  const products = await fetchStoreApi<WooProduct[]>(
    `products?category=${category.id}&per_page=100`,
  );

  const subcategories = categories.filter(
    (item) => item.parent === category.id,
  );

  return { category, products, subcategories };
});

export const getStoreProducts = cache(async () =>
  fetchStoreApi<WooProduct[]>("products?per_page=100"),
);

export const getProductBySlug = cache(async (slug: string) => {
  const products = await fetchStoreApi<WooProduct[]>(
    `products?slug=${encodeURIComponent(slug)}`,
  );

  return products[0] ?? null;
});

export const getProductReviews = cache(async (productId: number) =>
  fetchStoreApi<WooProductReview[]>(
    `products/reviews?product_id=${encodeURIComponent(productId)}&per_page=20`,
  ),
);

export const getNewArrivalProducts = cache(async () =>
  fetchStoreApi<WooProduct[]>(
    "products?orderby=date&order=desc&per_page=12",
  ),
);

/** Slug of the product highlighted in the homepage "discovery" panel. */
const FEATURED_DISCOVERY_SLUG = "white-oud-al-ahmed";

export const getHomepageCommerceData = cache(async () => {
  const [products, categories, featuredProducts] = await Promise.all([
    fetchStoreApi<WooProduct[]>("products?per_page=8"),
    getStoreCategories(),
    fetchStoreApi<WooProduct[]>(`products?slug=${FEATURED_DISCOVERY_SLUG}`),
  ]);

  return {
    products,
    categories: categories.filter((category) => category.parent === 0),
    featuredDiscoveryProduct: featuredProducts[0] ?? null,
  };
});

function formatMinorAmount(product: WooProduct, minorAmount: string) {
  const divisor = 10 ** product.prices.currency_minor_unit;
  const amount = Number(minorAmount) / divisor;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: product.prices.currency_code,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatPrice(product: WooProduct) {
  // Variable products carry a min–max range instead of a single price.
  const minorAmount =
    product.prices.price_range?.min_amount ?? product.prices.price;

  return formatMinorAmount(product, minorAmount);
}

export function formatRegularPrice(product: WooProduct) {
  const { regular_price, price } = product.prices;

  // Fall back to the current price when a regular price isn't set.
  return formatMinorAmount(product, regular_price || price);
}
