import "server-only";

import { parseCatalogQuery } from "@/lib/catalog-query";
import { parseSearchQuery } from "@/lib/product-search";
import {
  expandProductsForGrid,
  type ProductCardItem,
} from "@/lib/product-variants";
import {
  getAllProductsListing,
  getCategoryListingData,
  getSaleProducts,
  searchProducts,
  type CatalogListingOptions,
  type CatalogSort,
} from "@/lib/woocommerce";

/** Products per batch on category and search listings. */
export const CATALOG_PAGE_SIZE = 12;

/** Describes which product list an infinite grid is scrolling through. */
export type CatalogFeedSource =
  | { kind: "category"; slug: string; options: CatalogListingOptions }
  | { kind: "search"; query: string; options: CatalogListingOptions }
  | { kind: "all"; options: CatalogListingOptions }
  | { kind: "sale" };

export type CatalogFeedPage = {
  items: ProductCardItem[];
  page: number;
  totalPages: number;
};

/** Keeps only sale cards: a variable product needs at least one variant on sale. */
export function filterSaleItems(items: ProductCardItem[]) {
  return items.filter((item) =>
    item.variants.length > 0
      ? item.variants.some((variant) => variant.data.on_sale)
      : item.product.on_sale,
  );
}

function withCategories<T extends { categories: unknown[] }>(products: T[]) {
  return products.filter((product) => product.categories.length > 0);
}

/**
 * Re-validates a source that arrived from the browser. Server Actions are
 * public endpoints, so nothing in the payload is trusted as-is.
 */
export function sanitizeCatalogFeedSource(
  source: unknown,
): CatalogFeedSource | null {
  if (!source || typeof source !== "object") return null;
  const raw = source as Record<string, unknown>;
  const rawOptions =
    raw.options && typeof raw.options === "object"
      ? (raw.options as Record<string, unknown>)
      : {};
  const text = (value: unknown) => (typeof value === "string" ? value : undefined);
  const optionQuery = {
    sort: text(rawOptions.sort),
    availability: text(rawOptions.availability),
    brand: text(rawOptions.brand),
    price: text(rawOptions.price),
    concern: text(rawOptions.concern),
  };
  const parseOptions = (defaultSort: CatalogSort): CatalogListingOptions => {
    // parseCatalogQuery drops anything that isn't a known value.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page, ...options } = parseCatalogQuery(optionQuery, defaultSort);
    return options;
  };

  switch (raw.kind) {
    case "category": {
      if (typeof raw.slug !== "string" || !raw.slug) return null;
      return {
        kind: "category",
        slug: raw.slug.slice(0, 200),
        options: parseOptions("newest"),
      };
    }
    case "search": {
      const query = parseSearchQuery(
        typeof raw.query === "string" ? raw.query : undefined,
      );
      if (!query) return null;
      return { kind: "search", query, options: parseOptions("relevance") };
    }
    case "all":
      return { kind: "all", options: parseOptions("newest") };
    case "sale":
      return { kind: "sale" };
    default:
      return null;
  }
}

/** Fetches one page of product cards for the given source. */
export async function getCatalogFeedPage(
  source: CatalogFeedSource,
  page: number,
): Promise<CatalogFeedPage | null> {
  switch (source.kind) {
    case "category": {
      const data = await getCategoryListingData(
        source.slug,
        page,
        CATALOG_PAGE_SIZE,
        source.options,
      );
      if (!data) return null;
      return {
        items: await expandProductsForGrid(data.products),
        page: data.page,
        totalPages: data.totalPages,
      };
    }
    case "search": {
      const data = await searchProducts(
        source.query,
        page,
        CATALOG_PAGE_SIZE,
        source.options,
      );
      return {
        items: await expandProductsForGrid(withCategories(data.products)),
        page: data.page,
        totalPages: data.totalPages,
      };
    }
    case "all": {
      const data = await getAllProductsListing(
        page,
        CATALOG_PAGE_SIZE,
        source.options,
      );
      return {
        items: await expandProductsForGrid(withCategories(data.products)),
        page: data.page,
        totalPages: data.totalPages,
      };
    }
    case "sale": {
      const data = await getSaleProducts(page);
      const items = await expandProductsForGrid(withCategories(data.products));
      return {
        // Starred products are deals because the owner said so, even
        // without a sale price.
        items: data.handPicked ? items : filterSaleItems(items),
        page: data.page,
        totalPages: data.totalPages,
      };
    }
  }
}
