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

  return {
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    sort: rawSort && SORT_VALUES.has(rawSort) ? rawSort : defaultSort,
    availability:
      rawAvailability && AVAILABILITY_VALUES.has(rawAvailability)
        ? rawAvailability
        : "all",
  };
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
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (options.sort) params.set("sort", options.sort);
  if (options.availability && options.availability !== "all") {
    params.set("availability", options.availability);
  }
  if (page > 1) params.set("page", String(page));

  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}
