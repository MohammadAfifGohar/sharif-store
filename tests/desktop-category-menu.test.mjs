import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const menuSource = readFileSync(
  new URL("../src/components/desktop-category-menu.tsx", import.meta.url),
  "utf8",
);

test("desktop category popup stays categories-only", () => {
  assert.match(menuSource, /columns-4/);
  assert.match(menuSource, /hover:bg-primary\/10/);
  assert.doesNotMatch(menuSource, /activeCategoryId/);
  assert.doesNotMatch(menuSource, /category\.children/);
});

test("desktop category popup has no internal dividers", () => {
  assert.doesNotMatch(menuSource, /column-rule/);
  assert.doesNotMatch(menuSource, /border-r/);
});
