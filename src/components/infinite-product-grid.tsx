"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { loadMoreProducts } from "@/app/actions/load-more-products";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CatalogFeedSource } from "@/lib/catalog-feed";
import type { ProductCardItem } from "@/lib/product-variants";
import { cn } from "@/lib/utils";

/** Start fetching the next batch this far before the user reaches the end. */
const PREFETCH_MARGIN = "800px 0px";

const GRID_CLASS =
  "-mx-3 grid grid-cols-2 items-stretch gap-1 sm:mx-0 sm:gap-x-5 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4";

function LoadingCards() {
  return Array.from({ length: 4 }).map((_, index) => (
    <div key={index} className="flex min-w-0 flex-col gap-3" aria-hidden="true">
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <Skeleton className="h-4 w-4/5 rounded-sm" />
      <Skeleton className="h-4 w-2/5 rounded-sm" />
      <Skeleton className="h-8 w-full rounded-sm" />
    </div>
  ));
}

/**
 * Product grid that appends the next page of products as the user scrolls.
 * Give it a `key` that changes with the filters so it restarts from scratch.
 */
export function InfiniteProductGrid({
  source,
  initialItems,
  initialPage,
  totalPages,
  categorySlug,
  className,
}: {
  source: CatalogFeedSource;
  initialItems: ProductCardItem[];
  initialPage: number;
  totalPages: number;
  categorySlug?: string;
  className?: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialPage);
  const [lastPage, setLastPage] = useState(totalPages);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const hasMore = page < lastPage;

  const loadNext = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setStatus("loading");

    try {
      const result = await loadMoreProducts(source, page + 1);
      if (!result) throw new Error("Could not load more products");

      setItems((current) => {
        const seen = new Set(current.map((item) => item.product.id));
        return [
          ...current,
          ...result.items.filter((item) => !seen.has(item.product.id)),
        ];
      });
      setPage(result.page);
      setLastPage(result.totalPages);
      setStatus("idle");
    } catch {
      setStatus("error");
    } finally {
      loadingRef.current = false;
    }
  }, [hasMore, page, source]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || status === "error") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadNext();
      },
      { rootMargin: PREFETCH_MARGIN },
    );
    observer.observe(sentinel);

    // Re-created after each batch, so a sentinel that is still on screen
    // (short batch, tall monitor) immediately triggers the next load.
    return () => observer.disconnect();
  }, [hasMore, loadNext, status]);

  return (
    <>
      <div className={cn(GRID_CLASS, className)}>
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
        {status === "loading" ? <LoadingCards /> : null}
      </div>

      <div ref={sentinelRef} aria-hidden="true" className="h-px" />

      <div aria-live="polite" className="mt-8 flex justify-center">
        {status === "loading" ? (
          <span className="sr-only">Loading more products…</span>
        ) : status === "error" ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              More products could not be loaded.
            </p>
            <Button variant="outline" onClick={() => void loadNext()}>
              Try again
            </Button>
          </div>
        ) : !hasMore && page > 1 ? (
          <p className="text-sm text-muted-foreground">
            You&apos;ve seen all the products.
          </p>
        ) : null}
      </div>
    </>
  );
}
