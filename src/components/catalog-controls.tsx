"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { notifyCatalogNavigation } from "@/components/catalog-grid-transition";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONCERNS,
  EMPTY_FACETS,
  PRICE_BANDS,
  type CatalogFacets,
} from "@/lib/catalog-filters";
import { catalogSearchParams, hasActiveFilters } from "@/lib/catalog-query";
import type {
  CatalogListingOptions,
  CatalogSort,
} from "@/lib/woocommerce";

const STANDARD_SORT_ITEMS = [
  { label: "Newest first", value: "newest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Top rated", value: "rating" },
];

const AVAILABILITY_ITEMS = [
  { label: "All products", value: "all" },
  { label: "In stock", value: "in-stock" },
  { label: "On sale", value: "on-sale" },
];

/** "all" stands for "no filter" in every select. */
const ALL = "all";

type FilterName = "sort" | "availability" | "brand" | "price" | "concern";

function FilterSelect({
  label,
  value,
  items,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  items: Array<{ label: string; value: string }>;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <Select
        disabled={disabled}
        value={value}
        onValueChange={(next) => onChange(String(next))}
        items={items}
      >
        <SelectTrigger aria-label={label} className="h-9 w-full min-w-0 rounded-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function CatalogControls({
  basePath,
  query,
  options,
  defaultSort,
  facets = EMPTY_FACETS,
}: {
  basePath: string;
  query?: string;
  options: CatalogListingOptions;
  defaultSort: CatalogSort;
  facets?: CatalogFacets;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const sortItems =
    defaultSort === "relevance"
      ? [{ label: "Most relevant", value: "relevance" }, ...STANDARD_SORT_ITEMS]
      : STANDARD_SORT_ITEMS;

  // A filter is offered only when it can narrow this listing; one that is
  // already chosen always stays visible so it can be changed or cleared.
  const brandItems = [
    { label: "All brands", value: ALL },
    ...facets.brands.map((brand) => ({ label: `${brand.name} (${brand.count})`, value: brand.slug })),
  ];
  if (options.brand && !facets.brands.some((brand) => brand.slug === options.brand)) {
    brandItems.push({ label: options.brand, value: options.brand });
  }
  const showBrand = facets.brands.length > 1 || Boolean(options.brand);

  const concernItems = [
    { label: "All skin concerns", value: ALL },
    ...CONCERNS.filter(
      (concern) => facets.concerns.includes(concern.value) || concern.value === options.concern,
    ).map((concern) => ({ label: concern.label, value: concern.value })),
  ];
  const showConcern = concernItems.length > 1;

  const priceItems = [
    { label: "Any price", value: ALL },
    ...PRICE_BANDS.map((band) => ({ label: band.label, value: band.value })),
  ];

  function navigate(next: CatalogListingOptions) {
    const search = catalogSearchParams({ query, options: next, defaultSort }).toString();
    notifyCatalogNavigation();
    startTransition(() => {
      router.push(search ? `${basePath}?${search}` : pathname);
    });
  }

  function updateFilter(name: FilterName, value: string) {
    const next: CatalogListingOptions = { ...options, sort: options.sort ?? defaultSort };
    if (name === "sort") next.sort = value as CatalogListingOptions["sort"];
    else if (name === "availability") next.availability = value as CatalogListingOptions["availability"];
    else next[name] = value === ALL ? undefined : (value as never);
    navigate(next);
  }

  const active = hasActiveFilters(options);

  return (
    <div className="relative flex justify-end" aria-busy={isPending}>
      {isPending ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-primary/15"
        >
          <div className="h-full w-1/3 animate-pulse bg-primary" />
          <span className="sr-only">Updating products</span>
        </div>
      ) : null}
      <div className="grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:flex-wrap sm:justify-end sm:gap-2 sm:[&>*]:w-[168px]">
        <FilterSelect
          label="Sort products"
          value={options.sort ?? defaultSort}
          items={sortItems}
          disabled={isPending}
          onChange={(value) => updateFilter("sort", value)}
        />
        {showBrand ? (
          <FilterSelect
            label="Filter by brand"
            value={options.brand ?? ALL}
            items={brandItems}
            disabled={isPending}
            onChange={(value) => updateFilter("brand", value)}
          />
        ) : null}
        {showConcern ? (
          <FilterSelect
            label="Filter by skin concern"
            value={options.concern ?? ALL}
            items={concernItems}
            disabled={isPending}
            onChange={(value) => updateFilter("concern", value)}
          />
        ) : null}
        <FilterSelect
          label="Filter by price"
          value={options.price ?? ALL}
          items={priceItems}
          disabled={isPending}
          onChange={(value) => updateFilter("price", value)}
        />
        <FilterSelect
          label="Filter by availability"
          value={options.availability ?? ALL}
          items={AVAILABILITY_ITEMS}
          disabled={isPending}
          onChange={(value) => updateFilter("availability", value)}
        />
        {active ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => navigate({ sort: options.sort ?? defaultSort })}
            className="h-9 rounded-sm border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 sm:!w-auto"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
