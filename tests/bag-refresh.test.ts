import assert from "node:assert/strict";
import test from "node:test";

import { applyFreshBagLines, type BagItem, type FreshBagLine } from "../src/lib/bag";

function line(overrides: Partial<BagItem> = {}): BagItem {
  return {
    productId: 1,
    variationId: null,
    variationLabel: null,
    slug: "serum",
    categorySlug: "face-serum",
    name: "Serum",
    image: null,
    unitPrice: 299,
    regularUnitPrice: 599,
    currencyCode: "INR",
    quantity: 2,
    maxQuantity: null,
    soldIndividually: false,
    ...overrides,
  };
}

function fresh(overrides: Partial<FreshBagLine> = {}): FreshBagLine {
  return {
    productId: 1,
    variationId: null,
    available: true,
    unitPrice: 479,
    regularUnitPrice: 599,
    maxQuantity: null,
    soldIndividually: false,
    ...overrides,
  };
}

test("uses today's price and says what changed", () => {
  const { items, changes } = applyFreshBagLines([line()], [fresh()]);
  assert.equal(items[0].unitPrice, 479);
  assert.equal(items[0].quantity, 2);
  assert.deepEqual(changes, [{ kind: "price", name: "Serum", from: 299, to: 479 }]);
});

test("drops products that can no longer be bought and caps quantity to stock", () => {
  const bag = [line(), line({ productId: 2, name: "Toy", quantity: 5 })];
  const { items, changes } = applyFreshBagLines(bag, [
    fresh({ available: false }),
    fresh({ productId: 2, unitPrice: 299, maxQuantity: 3 }),
  ]);
  assert.deepEqual(items.map((item) => [item.productId, item.quantity]), [[2, 3]]);
  assert.deepEqual(changes, [
    { kind: "removed", name: "Serum" },
    { kind: "price", name: "Toy", from: 299, to: 299 },
    { kind: "quantity", name: "Toy", from: 5, to: 3 },
  ].filter((change) => !(change.kind === "price" && change.from === change.to)));
});

test("leaves lines alone when the store did not answer for them", () => {
  const bag = [line(), line({ productId: 2, variationId: 7, variationLabel: "50ml" })];
  const { items, changes } = applyFreshBagLines(bag, [fresh({ unitPrice: 299 })]);
  assert.deepEqual(items, bag);
  assert.deepEqual(changes, []);
});
