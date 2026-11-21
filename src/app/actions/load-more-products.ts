"use server";

import {
  getCatalogFeedPage,
  sanitizeCatalogFeedSource,
  type CatalogFeedPage,
} from "@/lib/catalog-feed";

/** Loads the next batch of product cards for an infinite-scroll grid. */
export async function loadMoreProducts(
  source: unknown,
  page: unknown,
): Promise<CatalogFeedPage | null> {
  const safeSource = sanitizeCatalogFeedSource(source);
  const safePage = Number(page);
  if (!safeSource || !Number.isInteger(safePage) || safePage < 2) return null;

  return getCatalogFeedPage(safeSource, safePage);
}
