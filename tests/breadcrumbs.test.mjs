import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const breadcrumbSource = read("../src/components/breadcrumbs.tsx");
const pageSources = [
  "../src/app/category/[slug]/page.tsx",
  "../src/app/category/[slug]/[productSlug]/page.tsx",
  "../src/app/new-arrivals/page.tsx",
  "../src/app/best-deals/page.tsx",
  "../src/app/contact/page.tsx",
  "../src/app/search/page.tsx",
].map(read);

test("breadcrumbs expose accessible navigation and the current page", () => {
  assert.match(breadcrumbSource, /aria-label="Breadcrumb"/);
  assert.match(breadcrumbSource, /aria-current="page"/);
  assert.match(breadcrumbSource, /href="\/"/);
});

test("every non-home storefront page uses the shared breadcrumbs", () => {
  for (const source of pageSources) {
    assert.match(source, /<Breadcrumbs/);
  }
});
