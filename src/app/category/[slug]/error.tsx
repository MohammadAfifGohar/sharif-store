"use client";

import { ShoppingBagIcon } from "lucide-react";

import { RouteErrorState } from "@/components/route-error-state";

export default function CategoryError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RouteErrorState
      scope="Category"
      icon={ShoppingBagIcon}
      title="This collection is taking a moment."
      description="We couldn't load these products. Please try again in a moment."
      error={error}
      onRetry={unstable_retry}
    />
  );
}
