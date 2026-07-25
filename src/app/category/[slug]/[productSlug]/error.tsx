"use client";

import { PackageXIcon } from "lucide-react";

import { RouteErrorState } from "@/components/route-error-state";

export default function ProductError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RouteErrorState
      scope="Product"
      icon={PackageXIcon}
      title="This product is taking a moment."
      description="We couldn't load the product details. Please try again in a moment."
      error={error}
      onRetry={unstable_retry}
    />
  );
}
