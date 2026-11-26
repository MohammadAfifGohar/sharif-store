import assert from "node:assert/strict";
import test from "node:test";

import {
  WISHLIST_LIMIT,
  isInWishlist,
  parseWishlist,
  removeWishlistEntries,
  toggleWishlistEntry,
} from "../src/lib/wishlist";

test("saving puts the product first, tapping again removes it", () => {
  let list = toggleWishlistEntry([], 10, "skin-care", 1);
  list = toggleWishlistEntry(list, 20, "toys", 2);
  assert.deepEqual(list.map((entry) => entry.productId), [20, 10]);
  assert.equal(isInWishlist(list, 10), true);

  list = toggleWishlistEntry(list, 10, "skin-care", 3);
  assert.deepEqual(list.map((entry) => entry.productId), [20]);
});

test("reads only valid saved data, without duplicates", () => {
  assert.deepEqual(parseWishlist(null), []);
  assert.deepEqual(parseWishlist("not json"), []);
  assert.deepEqual(parseWishlist(JSON.stringify([{ productId: "x" }])), []);

  const raw = JSON.stringify([
    { productId: 5, categorySlug: "toys", addedAt: 2 },
    { productId: 5, categorySlug: "toys", addedAt: 1 },
    { productId: 6, categorySlug: "skin-care", addedAt: 1 },
  ]);
  assert.deepEqual(parseWishlist(raw).map((entry) => entry.productId), [5, 6]);
});

test("keeps at most the limit and removes products that are gone", () => {
  let list = Array.from({ length: WISHLIST_LIMIT }, (_, i) => ({ productId: i + 1, categorySlug: "", addedAt: i }));
  list = toggleWishlistEntry(list, 999, "toys");
  assert.equal(list.length, WISHLIST_LIMIT);
  assert.equal(list[0].productId, 999);

  assert.deepEqual(
    removeWishlistEntries(list.slice(0, 3), [999, 1]).map((entry) => entry.productId),
    [2],
  );
});
