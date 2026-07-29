"use client";

import { BadgePercentIcon } from "lucide-react";

import { RouteErrorState } from "@/components/route-error-state";

export default function BestDealsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RouteErrorState
      scope="Best deals"
      icon={BadgePercentIcon}
      title="The best deals are taking a moment."
      description="We couldn't load the current sale products. Please try again shortly."
      error={error}
      onRetry={unstable_retry}
    />
  );
}
