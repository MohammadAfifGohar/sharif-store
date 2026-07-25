"use client";

import { ShoppingBagIcon } from "lucide-react";

import { RouteErrorState } from "@/components/route-error-state";

export default function HomeError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RouteErrorState
      scope="Home"
      icon={ShoppingBagIcon}
      title="The store is taking a moment."
      description="We couldn't load the latest products and categories. Please try again in a moment."
      error={error}
      onRetry={unstable_retry}
    />
  );
}
