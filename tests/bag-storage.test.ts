import assert from "node:assert/strict";
import test from "node:test";

import { parseBagItems } from "../src/lib/bag-storage";
import type { BagItem } from "../src/lib/bag";

const validItem: BagItem = {
  productId: 1,
  variationId: null,
  variationLabel: null,
  slug: "rose-oud-attar",
  categorySlug: "fragrance",
  name: "Rose Oud Attar",
  image: { src: "/rose-oud.jpg", alt: "Rose Oud" },
  unitPrice: 499,
  currencyCode: "INR",
  quantity: 2,
  maxQuantity: null,
  soldIndividually: false,
};

test("parseBagItems returns an empty array for null input", () => {
  assert.deepEqual(parseBagItems(null), []);
});

test("parseBagItems returns an empty array for malformed JSON", () => {
  assert.deepEqual(parseBagItems("{not json"), []);
});

test("parseBagItems returns an empty array when the shape doesn't match", () => {
  assert.deepEqual(parseBagItems(JSON.stringify([{ productId: "not-a-number" }])), []);
});

test("parseBagItems returns an empty array for a non-positive quantity", () => {
  const invalid = { ...validItem, quantity: 0 };

  assert.deepEqual(parseBagItems(JSON.stringify([invalid])), []);
});

test("parseBagItems returns the parsed items for valid JSON", () => {
  assert.deepEqual(parseBagItems(JSON.stringify([validItem])), [validItem]);
});

test("parseBagItems defaults variationId/variationLabel to null for pre-existing items missing those fields", () => {
  const { variationId, variationLabel, ...legacyItem } = validItem;
  void variationId;
  void variationLabel;

  assert.deepEqual(parseBagItems(JSON.stringify([legacyItem])), [validItem]);
});
