"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2Icon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { MIN_QUERY_LENGTH, useProductSearch } from "@/hooks/use-product-search";
import { getProductPath } from "@/lib/product-route";
import type { SearchResultItem } from "@/lib/product-search";
import { cn } from "@/lib/utils";

function useOutsideAndEscapeClose(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return containerRef;
}

type SearchResultsDropdownProps = {
  query: string;
  results: SearchResultItem[];
  isLoading: boolean;
  onNavigate: () => void;
  onViewAll: () => void;
  className?: string;
};

function SearchResultsDropdown({
  query,
  results,
  isLoading,
  onNavigate,
  onViewAll,
  className,
}: SearchResultsDropdownProps) {
  if (query.trim().length < MIN_QUERY_LENGTH) return null;

  return (
    <div
      className={cn(
        "absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border/70 bg-popover shadow-xl",
        className,
      )}
    >
      {isLoading ? (
        <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Searching…
        </div>
      ) : results.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted-foreground">
          No products found for &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <ul className="max-h-80 overflow-y-auto">
          {results.map((result) => (
            <li key={result.id}>
              <Link
                href={getProductPath(result.categorySlug, result.slug)}
                onClick={onNavigate}
                className="flex min-h-14 items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted"
              >
                <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {result.image ? (
                    <Image
                      src={result.image.src}
                      alt={result.image.alt}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold capitalize">
                    {result.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {result.priceDisplay}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {results.length > 0 ? (
        <button
          type="button"
          onClick={onViewAll}
          className="w-full border-t border-border px-4 py-2.5 text-left text-sm font-semibold text-primary hover:bg-muted"
        >
          View all results for &ldquo;{query}&rdquo;
        </button>
      ) : null}
    </div>
  );
}

/** One consistent, always-visible product search for every storefront route. */
export function HeaderSearchBar({ className }: { className?: string }) {
  const { query, setQuery, results, isLoading, submitSearch } = useProductSearch();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useOutsideAndEscapeClose(isOpen, () => setIsOpen(false));

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch();
          setIsOpen(false);
        }}
      >
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products, brands…"
          aria-label="Search for products"
          className="h-11 rounded-full border-border/70 bg-muted/55 pl-11 pr-4 shadow-inner shadow-black/[0.03] placeholder:text-muted-foreground/80 hover:bg-muted/70 focus-visible:border-primary/45 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/20"
        />
      </form>

      {isOpen ? (
        <SearchResultsDropdown
          query={query}
          results={results}
          isLoading={isLoading}
          onNavigate={() => setIsOpen(false)}
          onViewAll={() => {
            submitSearch();
            setIsOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
