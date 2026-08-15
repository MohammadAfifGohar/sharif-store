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

export function CatalogControls({
  basePath,
  query,
  options,
  defaultSort,
}: {
  basePath: string;
  query?: string;
  options: CatalogListingOptions;
  defaultSort: CatalogSort;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const sortItems =
    defaultSort === "relevance"
      ? [{ label: "Most relevant", value: "relevance" }, ...STANDARD_SORT_ITEMS]
      : STANDARD_SORT_ITEMS;

  function updateFilters(name: "sort" | "availability", value: string) {
    const params = new URLSearchParams();
    const nextSort = name === "sort" ? value : (options.sort ?? defaultSort);
    const nextAvailability =
      name === "availability" ? value : (options.availability ?? "all");

    if (query) params.set("q", query);
    if (nextSort !== defaultSort) params.set("sort", nextSort);
    if (nextAvailability !== "all") {
      params.set("availability", nextAvailability);
    }

    const search = params.toString();
    notifyCatalogNavigation();
    startTransition(() => {
      router.push(search ? `${basePath}?${search}` : pathname);
    });
  }

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
      <div className="grid w-full grid-cols-2 justify-end gap-1.5 sm:w-auto sm:grid-cols-[minmax(152px,180px)_minmax(132px,160px)] sm:gap-2">
        <div className="min-w-0">
          <Select
            disabled={isPending}
            value={options.sort ?? defaultSort}
            onValueChange={(value) => updateFilters("sort", String(value))}
            items={sortItems}
          >
            <SelectTrigger aria-label="Sort products" className="h-9 w-full min-w-0 rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {sortItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0">
          <Select
            disabled={isPending}
            value={options.availability ?? "all"}
            onValueChange={(value) =>
              updateFilters("availability", String(value))
            }
            items={AVAILABILITY_ITEMS}
          >
            <SelectTrigger aria-label="Filter by availability" className="h-9 w-full min-w-0 rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {AVAILABILITY_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
