import assert from "node:assert/strict";
import test from "node:test";

import { parseSearchQuery, toSearchResult } from "../src/lib/product-search";
import type { WooProduct } from "../src/lib/woocommerce";

function makeProduct(overrides: Partial<WooProduct> = {}): WooProduct {
  return {
    id: 1,
    name: "Rose Oud Attar",
    slug: "rose-oud-attar",
    type: "simple",
    on_sale: false,
    average_rating: "0",
    review_count: 0,
    images: [{ id: 1, src: "/rose-oud.jpg", thumbnail: "/rose-oud-thumb.jpg", alt: "Rose Oud" }],
    categories: [{ id: 1, name: "Fragrance", slug: "fragrance" }],
    tags: [],
    brands: [],
    attributes: [],
    prices: {
      price: "49900",
      regular_price: "49900",
      sale_price: "49900",
      currency_code: "INR",
      currency_symbol: "₹",
      currency_minor_unit: 2,
      price_range: null,
    },
    is_in_stock: true,
    has_options: false,
    ...overrides,
  };
}

test("toSearchResult derives categorySlug from the first category", () => {
  const result = toSearchResult(makeProduct());

  assert.equal(result.categorySlug, "fragrance");
  assert.equal(result.priceDisplay, "₹499");
  assert.deepEqual(result.image, { src: "/rose-oud.jpg", alt: "Rose Oud" });
});

test("toSearchResult falls back to an empty categorySlug when uncategorized", () => {
  const result = toSearchResult(makeProduct({ categories: [] }));

  assert.equal(result.categorySlug, "");
});

test("toSearchResult returns a null image when the product has none", () => {
  const result = toSearchResult(makeProduct({ images: [] }));

  assert.equal(result.image, null);
});

test("parseSearchQuery trims whitespace", () => {
  assert.equal(parseSearchQuery("  rose oud  "), "rose oud");
});

test("parseSearchQuery coalesces an array to its first value", () => {
  assert.equal(parseSearchQuery(["rose", "musk"]), "rose");
});

test("parseSearchQuery returns an empty string for undefined or blank input", () => {
  assert.equal(parseSearchQuery(undefined), "");
  assert.equal(parseSearchQuery("   "), "");
});
