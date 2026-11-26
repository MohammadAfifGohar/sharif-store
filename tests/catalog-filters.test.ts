import assert from "node:assert/strict";
import test from "node:test";

import { CONCERNS, filterParams } from "../src/lib/catalog-filters";
import {
  catalogSearchParams,
  getCatalogPageHref,
  hasActiveFilters,
  parseCatalogQuery,
} from "../src/lib/catalog-query";

test("reads brand, price and concern from the address bar", () => {
  const options = parseCatalogQuery(
    { brand: "Minimalist", price: "200-499", concern: "acne", page: "2" },
    "newest",
  );
  assert.deepEqual(options, {
    page: 2,
    sort: "newest",
    availability: "all",
    brand: "minimalist",
    price: "200-499",
    concern: "acne",
  });
});

test("ignores unknown or unsafe filter values", () => {
  const options = parseCatalogQuery(
    { brand: "../../etc", price: "free", concern: "everything" },
    "newest",
  );
  assert.equal(options.brand, undefined);
  assert.equal(options.price, undefined);
  assert.equal(options.concern, undefined);
});

test("turns filters into Store API parameters, prices in paise", () => {
  assert.deepEqual(filterParams({ brand: "plum", price: "200-499" }), [
    ["brand", "plum"],
    ["min_price", "20000"],
    ["max_price", "49999"],
  ]);
  assert.deepEqual(filterParams({ price: "under-200" }), [["max_price", "19999"]]);
  assert.deepEqual(filterParams({ price: "1000-plus" }), [["min_price", "100000"]]);

  const acne = CONCERNS.find((concern) => concern.value === "acne");
  assert.deepEqual(filterParams({ concern: "acne" }), [["tag", acne?.tags.join(",")]]);
});

test("keeps filters in links and leaves defaults out", () => {
  const options = { sort: "newest" as const, availability: "all" as const, brand: "plum", concern: "glow" as const };
  assert.equal(
    catalogSearchParams({ options, defaultSort: "newest" }).toString(),
    "brand=plum&concern=glow",
  );
  assert.equal(
    getCatalogPageHref({ basePath: "/shop", page: 2, options }),
    "/shop?sort=newest&brand=plum&concern=glow&page=2",
  );
});

test("sorting alone is not an active filter", () => {
  assert.equal(hasActiveFilters({ sort: "price-asc", availability: "all" }), false);
  assert.equal(hasActiveFilters({ price: "500-999" }), true);
});
