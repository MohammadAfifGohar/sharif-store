"use client";

import { RefreshCwIcon, ShoppingBagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouteErrorReporting } from "./hooks/use-route-error-reporting";

export default function HomeError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useRouteErrorReporting("Home", error);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
      <div
        role="alert"
        className="w-full max-w-xl rounded-2xl border border-border bg-card p-7 text-center shadow-sm sm:p-10"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-primary">
          <ShoppingBagIcon aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-heading text-3xl font-semibold">
          The store is taking a moment.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          We couldn&apos;t load the latest products and categories. Please try
          again in a moment.
        </p>
        <Button className="mt-7" onClick={unstable_retry}>
          <RefreshCwIcon aria-hidden="true" />
          Try again
        </Button>
        {error.digest ? (
          <p className="mt-5 text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
