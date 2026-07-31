import assert from "node:assert/strict";
import test from "node:test";

import { formatPrice, getRawPrice, type WooProduct } from "../src/lib/woocommerce";

function makeProduct(overrides: Partial<WooProduct> = {}): WooProduct {
  return {
    id: 1,
    name: "Rose Oud Attar",
    slug: "rose-oud-attar",
    type: "simple",
    on_sale: false,
    average_rating: "0",
    review_count: 0,
    images: [],
    categories: [],
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

test("getRawPrice matches the minor-unit amount formatPrice displays", () => {
  const product = makeProduct();

  assert.equal(getRawPrice(product), 499);
  assert.equal(formatPrice(product), "₹499");
});

test("getRawPrice uses the price range minimum for variable products", () => {
  const product = makeProduct({
    type: "variable",
    prices: {
      price: "0",
      regular_price: "0",
      sale_price: "0",
      currency_code: "INR",
      currency_symbol: "₹",
      currency_minor_unit: 2,
      price_range: { min_amount: "19900", max_amount: "39900" },
    },
  });

  assert.equal(getRawPrice(product), 199);
  assert.equal(formatPrice(product), "₹199");
});
