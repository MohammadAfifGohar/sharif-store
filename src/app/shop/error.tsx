"use client";

import { ShoppingBagIcon } from "lucide-react";

import { RouteErrorState } from "@/components/route-error-state";

export default function ShopError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RouteErrorState
      scope="All products"
      icon={ShoppingBagIcon}
      title="Our products are taking a moment."
      description="We couldn't load the product list. Please try again shortly."
      error={error}
      onRetry={unstable_retry}
    />
  );
}
