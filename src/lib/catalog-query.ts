import {
  isBrandSlug,
  isConcern,
  isPriceBand,
} from "@/lib/catalog-filters";
import type {
  CatalogAvailability,
  CatalogListingOptions,
  CatalogSort,
} from "@/lib/woocommerce";

type RawCatalogQuery = Record<string, string | string[] | undefined>;

const SORT_VALUES = new Set<CatalogSort>([
  "relevance",
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
  "rating",
]);
const AVAILABILITY_VALUES = new Set<CatalogAvailability>([
  "all",
  "in-stock",
  "on-sale",
]);

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseCatalogQuery(
  query: RawCatalogQuery,
  defaultSort: CatalogSort,
): CatalogListingOptions & { page: number } {
  const rawSort = first(query.sort) as CatalogSort | undefined;
  const rawAvailability = first(query.availability) as
    | CatalogAvailability
    | undefined;
  const parsedPage = Number(first(query.page));
  const brand = first(query.brand)?.toLowerCase();
  const price = first(query.price);
  const concern = first(query.concern);

  return {
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    sort: rawSort && SORT_VALUES.has(rawSort) ? rawSort : defaultSort,
    availability:
      rawAvailability && AVAILABILITY_VALUES.has(rawAvailability)
        ? rawAvailability
        : "all",
    ...(isBrandSlug(brand) ? { brand } : {}),
    ...(isPriceBand(price) ? { price } : {}),
    ...(isConcern(concern) ? { concern } : {}),
  };
}

/** Query-string parameters for a listing's options (defaults left out). */
export function catalogSearchParams({
  query,
  options,
  defaultSort,
}: {
  query?: string;
  options: CatalogListingOptions;
  defaultSort?: CatalogSort;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (options.sort && options.sort !== defaultSort) params.set("sort", options.sort);
  if (options.availability && options.availability !== "all") {
    params.set("availability", options.availability);
  }
  if (options.brand) params.set("brand", options.brand);
  if (options.price) params.set("price", options.price);
  if (options.concern) params.set("concern", options.concern);
  return params;
}

export function getCatalogPageHref({
  basePath,
  page,
  query,
  options,
}: {
  basePath: string;
  page: number;
  query?: string;
  options: CatalogListingOptions;
}) {
  const params = catalogSearchParams({ query, options });
  if (page > 1) params.set("page", String(page));

  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}

/** True when the shopper narrowed the list (sorting alone doesn't count). */
export function hasActiveFilters(options: CatalogListingOptions) {
  return Boolean(
    (options.availability && options.availability !== "all") ||
      options.brand ||
      options.price ||
      options.concern,
  );
}
