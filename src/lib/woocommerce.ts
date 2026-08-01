import { cache } from "react";

import { selectFirstProductWithImage } from "@/lib/product-selection";
import { getWordpressUrl } from "@/lib/site-config";

/** Abort a WooCommerce request that hasn't responded within this window. */
const REQUEST_TIMEOUT_MS = 10_000;

/** Retry transient (likely rate-limit or cold-start) 5xx failures before giving up. */
const RETRYABLE_RETRY_COUNT = 2;
const RETRY_DELAY_MS = 500;

export class WooCommerceError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`WooCommerce request to "${path}" failed with ${status}`);
    this.name = "WooCommerceError";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  /** Lightweight variation list on a variable parent product — id + attribute combo only, no price/stock. */
  variations?: Array<{
    id: number;
    attributes: Array<{ name: string; value: string }>;
  }>;
};

async function fetchStoreApiResponse(path: string) {
  for (let attempt = 0; ; attempt++) {
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

    if (response.ok) return response;

    // Only 5xx responses are treated as transient; 4xx (e.g. unknown slug) fails fast.
    const isRetryable = response.status >= 500;
    if (!isRetryable || attempt >= RETRYABLE_RETRY_COUNT) {
      throw new WooCommerceError(response.status, path);
    }

    await sleep(RETRY_DELAY_MS * 2 ** attempt);
  }
}

async function fetchStoreApi<T>(path: string): Promise<T> {
  const response = await fetchStoreApiResponse(path);

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
  try {
    const products = await fetchStoreApi<WooProduct[]>(
      `products?slug=${encodeURIComponent(slug)}`,
    );

    return products[0] ?? null;
  } catch (error) {
    // The single-product lookup can 500 even when the bulk listing (already
    // fetched for generateStaticParams) is healthy. Fall back to it instead
    // of failing the whole build over one flaky product endpoint.
    if (error instanceof WooCommerceError && error.status >= 500) {
      const products = await getStoreProducts();
      return products.find((product) => product.slug === slug) ?? null;
    }

    throw error;
  }
});

export const getProductById = cache(async (id: number) =>
  fetchStoreApi<WooProduct>(`products/${id}`),
);

/**
 * Resolves the full price/stock/image data for every variation of a variable
 * product. The Store API only embeds lightweight `{ id, attributes }` entries
 * on the parent — each variation must be fetched individually as its own
 * product-shaped object.
 */
export const getProductVariations = cache(async (product: WooProduct) => {
  if (!product.has_options || !product.variations?.length) return [];

  return Promise.all(
    product.variations.map((variation) => getProductById(variation.id)),
  );
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

export const getSaleProducts = cache(async (page: number) => {
  const perPage = 24;
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const response = await fetchStoreApiResponse(
    `products?on_sale=true&orderby=date&order=desc&page=${safePage}&per_page=${perPage}`,
  );
  const products = (await response.json()) as WooProduct[];

  return {
    products: products.filter((product) => product.on_sale),
    page: safePage,
    perPage,
    total: Number(response.headers.get("x-wp-total") ?? products.length),
    totalPages: Number(response.headers.get("x-wp-totalpages") ?? 1),
  };
});

export const searchProducts = cache(
  async (query: string, page: number, perPage = 24) => {
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const response = await fetchStoreApiResponse(
      `products?search=${encodeURIComponent(query)}&page=${safePage}&per_page=${perPage}`,
    );
    const products = (await response.json()) as WooProduct[];

    return {
      products,
      page: safePage,
      perPage,
      total: Number(response.headers.get("x-wp-total") ?? products.length),
      totalPages: Number(response.headers.get("x-wp-totalpages") ?? 1),
    };
  },
);

export const getHomepageCommerceData = cache(async () => {
  const [products, categories] = await Promise.all([
    fetchStoreApi<WooProduct[]>(
      "products?orderby=date&order=desc&per_page=8",
    ),
    getStoreCategories(),
  ]);

  return {
    products,
    categories: categories.filter((category) => category.parent === 0),
    featuredDiscoveryProduct: selectFirstProductWithImage(products),
  };
});

export function formatMoneyAmount(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatMinorAmount(product: WooProduct, minorAmount: string) {
  return formatMoneyAmount(
    getMajorAmount(minorAmount, product.prices.currency_minor_unit),
    product.prices.currency_code,
  );
}

function getMajorAmount(minorAmount: string, currencyMinorUnit: number) {
  const divisor = 10 ** currencyMinorUnit;
  const amount = Number(minorAmount) / divisor;

  return Number.isFinite(amount) ? amount : 0;
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

/** Raw numeric price (major units) matching what `formatPrice` displays. */
export function getRawPrice(product: WooProduct) {
  const minorAmount =
    product.prices.price_range?.min_amount ?? product.prices.price;

  return getMajorAmount(minorAmount, product.prices.currency_minor_unit);
}

/** "₹180 – ₹280" when the product has a real min–max range, else null. */
export function formatPriceRange(product: WooProduct) {
  const range = product.prices.price_range;
  if (!range || range.min_amount === range.max_amount) return null;

  const min = formatMinorAmount(product, range.min_amount);
  const max = formatMinorAmount(product, range.max_amount);

  return `${min} – ${max}`;
}

/** Percentage off the regular price, rounded; 0 when not on sale or not a real discount. */
export function getDiscountPercent(product: WooProduct) {
  const regular = Number(product.prices.regular_price);
  const current = Number(product.prices.price);

  if (!product.on_sale || !regular || current >= regular) return 0;

  return Math.round(((regular - current) / regular) * 100);
}

/** Amount saved off the regular price (major units); 0 when not on sale. */
export function getSavingsAmount(product: WooProduct) {
  if (!product.on_sale) return 0;

  const { currency_minor_unit, regular_price } = product.prices;
  const regular = getMajorAmount(regular_price, currency_minor_unit);
  const current = getRawPrice(product);

  return regular > current ? regular - current : 0;
}
