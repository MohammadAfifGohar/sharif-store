"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { SearchResultItem } from "@/lib/product-search";

export const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export function useProductSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [fetchedResults, setFetchedResults] = useState<SearchResultItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const trimmedQuery = query.trim();
  const isQueryEligible = trimmedQuery.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (trimmedQuery.length < MIN_QUERY_LENGTH) return;

    const controller = new AbortController();
    let isActive = true;

    const timeout = setTimeout(async () => {
      setIsFetching(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as { results: SearchResultItem[] };
        if (isActive) setFetchedResults(data.results);
      } catch (error) {
        if (isActive && (error as Error).name !== "AbortError") {
          setFetchedResults([]);
        }
      } finally {
        if (isActive) setIsFetching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      isActive = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [trimmedQuery]);

  function submitSearch() {
    if (trimmedQuery) router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  }

  return {
    query,
    setQuery,
    results: isQueryEligible ? fetchedResults : [],
    isLoading: isQueryEligible && isFetching,
    submitSearch,
  };
}
