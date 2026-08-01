import assert from "node:assert/strict";
import test from "node:test";

import {
  buildProductCardItems,
  getVariationLabel,
  parseVariationSummary,
} from "../src/lib/product-variants";
import type { WooProduct } from "../src/lib/woocommerce";

function makeProduct(overrides: Partial<WooProduct> = {}): WooProduct {
  return {
    id: 12,
    name: "foxtale face wash",
    slug: "face-wash",
    type: "variable",
    on_sale: true,
    average_rating: "5",
    review_count: 1,
    images: [{ id: 51, src: "/face-wash.jpg", thumbnail: "/face-wash-thumb.jpg", alt: "" }],
    categories: [{ id: 39, name: "Face Wash", slug: "face-wash" }],
    tags: [],
    brands: [],
    attributes: [
      {
        id: 0,
        name: "Size",
        has_variations: true,
        terms: [
          { id: 0, name: "100 ml", slug: "100 ml" },
          { id: 0, name: "150 ml", slug: "150 ml" },
        ],
      },
    ],
    prices: {
      price: "18000",
      regular_price: "24900",
      sale_price: "18000",
      currency_code: "INR",
      currency_symbol: "₹",
      currency_minor_unit: 2,
      price_range: { min_amount: "18000", max_amount: "28000" },
    },
    is_in_stock: true,
    has_options: true,
    variations: [
      { id: 54, attributes: [{ name: "size", value: "100 ml" }] },
      { id: 55, attributes: [{ name: "size", value: "150 ml" }] },
    ],
    ...overrides,
  };
}

function makeVariation(overrides: Partial<WooProduct> = {}): WooProduct {
  return makeProduct({
    id: 54,
    type: "variation",
    variation: "size: 100 ml",
    has_options: false,
    variations: undefined,
    attributes: [],
    prices: {
      price: "18000",
      regular_price: "24900",
      sale_price: "18000",
      currency_code: "INR",
      currency_symbol: "₹",
      currency_minor_unit: 2,
      price_range: null,
    },
    ...overrides,
  });
}

function makeSimpleProduct(overrides: Partial<WooProduct> = {}): WooProduct {
  return makeProduct({
    id: 1,
    name: "Rose Oud Attar",
    slug: "rose-oud-attar",
    type: "simple",
    has_options: false,
    attributes: [],
    variations: undefined,
    prices: {
      price: "49900",
      regular_price: "49900",
      sale_price: "49900",
      currency_code: "INR",
      currency_symbol: "₹",
      currency_minor_unit: 2,
      price_range: null,
    },
    ...overrides,
  });
}

test("parseVariationSummary parses a single-attribute summary", () => {
  assert.deepEqual(parseVariationSummary("size: 100 ml"), { size: "100 ml" });
});

test("parseVariationSummary parses a multi-attribute summary", () => {
  assert.deepEqual(parseVariationSummary("size: 100 ml, color: red"), {
    size: "100 ml",
    color: "red",
  });
});

test("parseVariationSummary returns an empty object for undefined", () => {
  assert.deepEqual(parseVariationSummary(undefined), {});
});

test("getVariationLabel builds a properly-cased label", () => {
  const product = makeProduct();

  assert.equal(getVariationLabel(product, { size: "100 ml" }), "Size: 100 ml");
});

test("buildProductCardItems returns one item with no variant for a simple product", () => {
  const product = makeSimpleProduct();

  const items = buildProductCardItems([product], new Map());

  assert.deepEqual(items, [{ product, variant: null }]);
});

test("buildProductCardItems returns one item per resolved variation for a variable product", () => {
  const product = makeProduct();
  const small = makeVariation({ id: 54, variation: "size: 100 ml" });
  const large = makeVariation({ id: 55, variation: "size: 150 ml" });

  const items = buildProductCardItems(
    [product],
    new Map([[product.id, [small, large]]]),
  );

  assert.equal(items.length, 2);
  assert.equal(items[0].product, product);
  assert.equal(items[1].product, product);
  assert.deepEqual(
    items.map((item) => item.variant?.id),
    [54, 55],
  );
  assert.equal(items[0].variant?.label, "Size: 100 ml");
  assert.equal(items[0].variant?.shortLabel, "100 ml");
  assert.equal(items[0].variant?.data, small);
});

test("buildProductCardItems falls back to a single card when variations are missing", () => {
  const product = makeProduct();

  const items = buildProductCardItems([product], new Map());

  assert.deepEqual(items, [{ product, variant: null }]);
});

test("buildProductCardItems preserves order across mixed simple and variable products", () => {
  const simple = makeSimpleProduct({ id: 1 });
  const variable = makeProduct({ id: 12 });
  const variation = makeVariation({ id: 54, variation: "size: 100 ml" });

  const items = buildProductCardItems(
    [simple, variable],
    new Map([[variable.id, [variation]]]),
  );

  assert.equal(items.length, 2);
  assert.equal(items[0].product.id, 1);
  assert.equal(items[0].variant, null);
  assert.equal(items[1].product.id, 12);
  assert.equal(items[1].variant?.id, 54);
});
