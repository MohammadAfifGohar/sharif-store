import assert from "node:assert/strict";
import test from "node:test";

import {
  addItemToBag,
  getBagSubtotal,
  getBagTotalCount,
  removeItemFromBag,
  setItemQuantity,
  toBagItem,
  type BagItem,
} from "../src/lib/bag";
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

test("toBagItem builds a line item with the raw unit price", () => {
  const item = toBagItem(makeProduct(), "fragrance", 1);

  assert.equal(item.productId, 1);
  assert.equal(item.unitPrice, 499);
  assert.equal(item.currencyCode, "INR");
  assert.equal(item.quantity, 1);
  assert.equal(item.maxQuantity, null);
});

test("toBagItem caps quantity at 1 for sold-individually products", () => {
  const item = toBagItem(makeProduct({ sold_individually: true }), "fragrance", 5);

  assert.equal(item.maxQuantity, 1);
  assert.equal(item.quantity, 1);
});

test("toBagItem clamps quantity to low stock remaining", () => {
  const item = toBagItem(makeProduct({ low_stock_remaining: 2 }), "fragrance", 5);

  assert.equal(item.maxQuantity, 2);
  assert.equal(item.quantity, 2);
});

test("addItemToBag appends a new line for a product not already in the bag", () => {
  const first = toBagItem(makeProduct({ id: 1 }), "fragrance", 1);
  const second = toBagItem(makeProduct({ id: 2, slug: "musk" }), "fragrance", 1);

  const result = addItemToBag([first], second);

  assert.equal(result.length, 2);
  assert.deepEqual(result.map((line) => line.productId), [1, 2]);
});

test("addItemToBag increments quantity when the product is already in the bag", () => {
  const existing = toBagItem(makeProduct(), "fragrance", 1);
  const added = toBagItem(makeProduct(), "fragrance", 2);

  const result = addItemToBag([existing], added);

  assert.equal(result.length, 1);
  assert.equal(result[0].quantity, 3);
});

test("addItemToBag clamps the combined quantity to maxQuantity", () => {
  const existing = toBagItem(makeProduct({ low_stock_remaining: 3 }), "fragrance", 2);
  const added = toBagItem(makeProduct({ low_stock_remaining: 3 }), "fragrance", 5);

  const result = addItemToBag([existing], added);

  assert.equal(result[0].quantity, 3);
});

test("removeItemFromBag removes only the matching line", () => {
  const first = toBagItem(makeProduct({ id: 1 }), "fragrance", 1);
  const second = toBagItem(makeProduct({ id: 2, slug: "musk" }), "fragrance", 1);

  const result = removeItemFromBag([first, second], 1);

  assert.deepEqual(result.map((line) => line.productId), [2]);
});

test("setItemQuantity updates the quantity of the matching line", () => {
  const item = toBagItem(makeProduct(), "fragrance", 1);

  const result = setItemQuantity([item], item.productId, 4);

  assert.equal(result[0].quantity, 4);
});

test("setItemQuantity removes the line when quantity drops to 0", () => {
  const item = toBagItem(makeProduct(), "fragrance", 1);

  const result = setItemQuantity([item], item.productId, 0);

  assert.equal(result.length, 0);
});

test("getBagTotalCount sums quantities across lines", () => {
  const items: BagItem[] = [
    toBagItem(makeProduct({ id: 1 }), "fragrance", 2),
    toBagItem(makeProduct({ id: 2, slug: "musk" }), "fragrance", 3),
  ];

  assert.equal(getBagTotalCount(items), 5);
});

test("getBagSubtotal sums unit price times quantity across lines", () => {
  const items: BagItem[] = [
    toBagItem(makeProduct({ id: 1 }), "fragrance", 2),
    toBagItem(makeProduct({ id: 2, slug: "musk" }), "fragrance", 1),
  ];

  assert.equal(getBagSubtotal(items), 499 * 2 + 499 * 1);
});
