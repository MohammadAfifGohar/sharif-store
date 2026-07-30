"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
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
        "absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-lg",
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
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted"
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

/** Always-visible search bar, shown only on the homepage. */
export function HeaderSearchBar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { query, setQuery, results, isLoading, submitSearch } = useProductSearch();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useOutsideAndEscapeClose(isOpen, () => setIsOpen(false));

  if (pathname !== "/") return null;

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
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for products"
          aria-label="Search for products"
          className="h-10 pl-9"
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

/** Compact search icon that expands in place into the search UI, shown on every non-homepage route. */
export function HeaderSearchTrigger() {
  const pathname = usePathname();
  const { query, setQuery, results, isLoading, submitSearch } = useProductSearch();
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useOutsideAndEscapeClose(isOpen, () => setIsOpen(false));

  if (pathname === "/") return null;

  function close() {
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className={cn("size-11", isOpen && "pointer-events-none opacity-0")}
        onClick={() => setIsOpen(true)}
        aria-label="Search products"
      >
        <SearchIcon />
      </Button>

      <AnimatePresence>
        {isOpen ? (
          <motion.form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
              close();
            }}
            initial={shouldReduceMotion ? false : { width: 44, opacity: 0 }}
            animate={{ width: "min(18rem, 70vw)", opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { width: 44, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute right-0 top-1/2 z-10 flex h-11 -translate-y-1/2 items-center gap-1 overflow-hidden rounded-full border border-border bg-popover pr-1 shadow-md"
          >
            <SearchIcon className="ml-3 size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for products"
              aria-label="Search for products"
              className="h-9 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={close}
              aria-label="Close search"
            >
              <XIcon />
            </Button>
          </motion.form>
        ) : null}
      </AnimatePresence>

      {isOpen ? (
        <SearchResultsDropdown
          query={query}
          results={results}
          isLoading={isLoading}
          onNavigate={close}
          onViewAll={() => {
            submitSearch();
            close();
          }}
          className="inset-x-auto right-0 w-[min(18rem,70vw)]"
        />
      ) : null}
    </div>
  );
}
