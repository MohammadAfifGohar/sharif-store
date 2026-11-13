import assert from "node:assert/strict";
import test from "node:test";

import { withoutEmptyCategories, type WooCategory } from "../src/lib/woocommerce";

function category(id: number, slug: string, count: number, parent = 0) {
  return { id, slug, name: slug, count, parent } as WooCategory;
}

test("hides categories with no products, including Uncategorized", () => {
  const result = withoutEmptyCategories([
    category(15, "toys", 2),
    category(21, "baby-care", 0),
    category(41, "uncategorized", 0),
  ]);

  assert.deepEqual(
    result.map((item) => item.slug),
    ["toys"],
  );
});

test("keeps a parent whose products live only in a subcategory", () => {
  const result = withoutEmptyCategories([
    category(26, "fragrances", 0),
    category(37, "perfumes", 3, 26),
    category(17, "hair-care", 0),
  ]);

  assert.deepEqual(
    result.map((item) => item.slug),
    ["fragrances", "perfumes"],
  );
});

test("keeps a grandparent when only a deeper subcategory has products", () => {
  const result = withoutEmptyCategories([
    category(1, "beauty", 0),
    category(2, "skin", 0, 1),
    category(3, "serums", 1, 2),
  ]);

  assert.equal(result.length, 3);
});
