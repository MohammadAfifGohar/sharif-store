import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { CatalogControls } from "@/components/catalog-controls";
import { CatalogGridTransition } from "@/components/catalog-grid-transition";
import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import { getCatalogPageHref } from "@/lib/catalog-query";
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
  basePath: string;
  query?: string;
  options: CatalogListingOptions;
  defaultSort: CatalogSort;
  categorySlug?: string;
  hideHeader?: boolean;
  toolbarStart?: ReactNode;
}) {
  const hrefForPage = (targetPage: number) =>
    getCatalogPageHref({
      basePath,
      page: targetPage,
      query,
      options,
    });

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
            {totalPages > 1 ? (
              <span className="block text-xs">
                Page {page} of {totalPages}
              </span>
            ) : null}
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

      <CatalogGridTransition
        navigationKey={`${page}:${query ?? ""}:${options.sort ?? defaultSort}:${options.availability ?? "all"}`}
      >
      {items.length > 0 ? (
        <>
          <div className="-mx-3 mt-6 grid grid-cols-2 items-stretch gap-x-1 gap-y-4 sm:mx-0 sm:gap-x-5 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <ProductCard
                key={item.product.id}
                product={item.product}
                categorySlug={
                  categorySlug ?? item.product.categories[0]?.slug ?? ""
                }
                variants={item.variants}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              aria-label={`${title} pagination`}
              className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-7"
            >
              {page > 1 ? (
                <Link
                  href={hrefForPage(page - 1)}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <ArrowLeftIcon aria-hidden="true" />
                  Previous
                </Link>
              ) : (
                <span />
              )}
              {page < totalPages ? (
                <Link
                  href={hrefForPage(page + 1)}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Next
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              ) : null}
            </nav>
          ) : null}
        </>
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
