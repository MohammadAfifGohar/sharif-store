import assert from "node:assert/strict";
import test from "node:test";

import { getProductPath } from "../src/lib/product-route";

test("builds the canonical nested product route", () => {
  assert.equal(
    getProductPath("fragrance", "scarlett-red-long-dress"),
    "/category/fragrance/scarlett-red-long-dress",
  );
});

test("encodes category and product path segments", () => {
  assert.equal(
    getProductPath("skin & care", "rose oud / 50ml"),
    "/category/skin%20%26%20care/rose%20oud%20%2F%2050ml",
  );
});

test("decodes WordPress percent-encoded slugs before encoding the path", () => {
  assert.equal(
    getProductPath("face-wash", "gel-face-wash-100ml-%f0%9f%8d%89"),
    "/category/face-wash/gel-face-wash-100ml-%F0%9F%8D%89",
  );
});
