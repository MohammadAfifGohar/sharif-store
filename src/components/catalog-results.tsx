import Link from "next/link";
import type { ReactNode } from "react";

import { CatalogControls } from "@/components/catalog-controls";
import { CatalogGridTransition } from "@/components/catalog-grid-transition";
import { InfiniteProductGrid } from "@/components/infinite-product-grid";
import { buttonVariants } from "@/components/ui/button";
import type { CatalogFeedSource } from "@/lib/catalog-feed";
import type { ProductCardItem } from "@/lib/product-variants";
import type {
  CatalogListingOptions,
  CatalogSort,
} from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

export function CatalogResults({
  title,
  eyebrow,
  items,
  total,
  page,
  totalPages,
  source,
  basePath,
  query,
  options,
  defaultSort,
  categorySlug,
  hideHeader = false,
  toolbarStart,
}: {
  title: string;
  eyebrow?: string;
  items: ProductCardItem[];
  total: number;
  page: number;
  totalPages: number;
  source: CatalogFeedSource;
  basePath: string;
  query?: string;
  options: CatalogListingOptions;
  defaultSort: CatalogSort;
  categorySlug?: string;
  hideHeader?: boolean;
  toolbarStart?: ReactNode;
}) {
  const navigationKey = `${basePath}:${page}:${query ?? ""}:${options.sort ?? defaultSort}:${options.availability ?? "all"}`;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 pt-7 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
      {!hideHeader ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground sm:text-right">
            {total} {total === 1 ? "product" : "products"}
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between",
          !hideHeader && "mt-6",
        )}
      >
        {toolbarStart ? <div className="shrink-0">{toolbarStart}</div> : null}
        <div className="min-w-0 sm:ml-auto sm:flex-none">
          <CatalogControls
            basePath={basePath}
            query={query}
            options={options}
            defaultSort={defaultSort}
          />
        </div>
      </div>

      <CatalogGridTransition navigationKey={navigationKey}>
      {items.length > 0 ? (
        <InfiniteProductGrid
          key={navigationKey}
          source={source}
          initialItems={items}
          initialPage={page}
          totalPages={totalPages}
          categorySlug={categorySlug}
          className="mt-6"
        />
      ) : (
        <div className="mt-9 rounded-3xl border border-border bg-background px-6 py-16 text-center shadow-sm sm:py-20">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            No matching products
          </h2>
          <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
            Clear the filters or try a wider price range to see more products.
          </p>
          <Link
            href={query ? `${basePath}?q=${encodeURIComponent(query)}` : basePath}
            className={`${buttonVariants({ size: "lg" })} mt-7`}
          >
            Clear filters
          </Link>
        </div>
      )}
      </CatalogGridTransition>
    </section>
  );
}

