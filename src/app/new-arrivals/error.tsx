"use client";

import { SparklesIcon } from "lucide-react";

import { RouteErrorState } from "@/components/route-error-state";

export default function NewArrivalsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RouteErrorState
      scope="New arrivals"
      icon={SparklesIcon}
      title="The latest arrivals are taking a moment."
      description="We couldn't load the newest products. Please try again shortly."
      error={error}
      onRetry={unstable_retry}
    />
  );
}
