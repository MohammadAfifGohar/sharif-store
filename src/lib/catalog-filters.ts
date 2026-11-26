/**
 * Shopper filters for product listings (brand, price, skin concern). Safe to
 * import from client components: no server-only code here.
 *
 * All three map onto filters the WooCommerce Store API already supports:
 * `brand` (brand slug), `min_price` / `max_price` (in paise) and `tag` (a
 * comma-separated list of tag slugs, matching any of them).
 */

export type CatalogPriceBand = "under-200" | "200-499" | "500-999" | "1000-plus";

export const PRICE_BANDS: ReadonlyArray<{
  value: CatalogPriceBand;
  label: string;
  /** Rupees, inclusive. */
  min?: number;
  max?: number;
}> = [
  { value: "under-200", label: "Under ₹200", max: 199 },
  { value: "200-499", label: "₹200 – ₹499", min: 200, max: 499 },
  { value: "500-999", label: "₹500 – ₹999", min: 500, max: 999 },
  { value: "1000-plus", label: "₹1,000 & above", min: 1000 },
];

export type CatalogConcern =
  | "acne"
  | "dark-spots"
  | "glow"
  | "oily-skin"
  | "dryness"
  | "ageing"
  | "sensitive";

/**
 * Each concern is a group of the product tags already used on the store. A
 * product shows up under a concern when it has any of these tags, so new
 * products only need sensible tags to appear in the right place.
 */
export const CONCERNS: ReadonlyArray<{
  value: CatalogConcern;
  label: string;
  tags: readonly string[];
}> = [
  {
    value: "acne",
    label: "Acne & breakouts",
    tags: [
      "acne", "anti-acne", "blemish", "blemishes", "blackheads", "salicylic-acid",
      "salicylic-acid-serum", "salicylic-acid-face-wash", "tea-tree-face-wash",
    ],
  },
  {
    value: "dark-spots",
    label: "Dark spots & pigmentation",
    tags: [
      "pigmentation", "dark-spots", "acne-marks", "acne-scars", "melasma", "alpha-arbutin",
      "alpha-arbutin-serum", "kojic-acid-serum", "tranexamic-acid-serum", "de-tan", "de-tan-face-wash",
    ],
  },
  {
    value: "glow",
    label: "Dullness & glow",
    tags: [
      "glow", "glowing-skin", "brightening", "vitamin-c", "vitamin-c-serum", "vitamin-c-face-wash",
      "glutathione", "glutathione-serum",
    ],
  },
  {
    value: "oily-skin",
    label: "Oily skin",
    tags: ["oil-control", "oil-control-serum", "oily-skin", "clay"],
  },
  {
    value: "dryness",
    label: "Dryness & hydration",
    tags: ["hydration", "dry-skin", "hyaluronic-acid", "hyaluronic-acid-serum", "skin-barrier"],
  },
  {
    value: "ageing",
    label: "Fine lines & ageing",
    tags: ["anti-ageing", "anti-aging", "fine-lines", "retinol-serum", "bakuchiol", "peptides"],
  },
  {
    value: "sensitive",
    label: "Sensitive skin",
    tags: ["sensitive-skin", "cica", "cica-face-wash", "fragrance-free"],
  },
];

const BRAND_SLUG = /^[a-z0-9][a-z0-9-]{0,99}$/;

export function isBrandSlug(value: unknown): value is string {
  return typeof value === "string" && BRAND_SLUG.test(value);
}

export function isPriceBand(value: unknown): value is CatalogPriceBand {
  return PRICE_BANDS.some((band) => band.value === value);
}

export function isConcern(value: unknown): value is CatalogConcern {
  return CONCERNS.some((concern) => concern.value === value);
}

/** Store API query parameters for the chosen filters. */
export function filterParams(filters: {
  brand?: string;
  price?: CatalogPriceBand;
  concern?: CatalogConcern;
}): Array<[string, string]> {
  const params: Array<[string, string]> = [];
  if (filters.brand && isBrandSlug(filters.brand)) {
    params.push(["brand", filters.brand]);
  }
  const band = PRICE_BANDS.find((item) => item.value === filters.price);
  if (band) {
    // The Store API compares prices in the smallest currency unit (paise).
    if (band.min !== undefined) params.push(["min_price", String(band.min * 100)]);
    if (band.max !== undefined) params.push(["max_price", String(band.max * 100 + 99)]);
  }
  const concern = CONCERNS.find((item) => item.value === filters.concern);
  if (concern) params.push(["tag", concern.tags.join(",")]);
  return params;
}

/** Brands and concerns that have products in the listing being browsed. */
export type CatalogFacets = {
  brands: Array<{ slug: string; name: string; count: number }>;
  concerns: CatalogConcern[];
};

export const EMPTY_FACETS: CatalogFacets = { brands: [], concerns: [] };
