"use client";

import { SearchIcon } from "lucide-react";

import { RouteErrorState } from "@/components/route-error-state";

export default function SearchError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RouteErrorState
      scope="Search"
      icon={SearchIcon}
      title="Search is taking a moment."
      description="We couldn't load these search results. Please try again shortly."
      error={error}
      onRetry={unstable_retry}
    />
  );
}
