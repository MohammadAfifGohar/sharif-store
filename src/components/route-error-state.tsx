"use client";

import type { LucideIcon } from "lucide-react";
import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouteErrorReporting } from "@/hooks/use-route-error-reporting";

type RouteErrorStateProps = {
  /** Short label used for error logging, e.g. "Product". */
  scope: string;
  icon: LucideIcon;
  title: string;
  description: string;
  error: Error & { digest?: string };
  onRetry: () => void;
};

/**
 * Shared UI for App Router `error.tsx` boundaries. Renders the error card and
 * reports the error via {@link useRouteErrorReporting}.
 */
export function RouteErrorState({
  scope,
  icon: Icon,
  title,
  description,
  error,
  onRetry,
}: RouteErrorStateProps) {
  useRouteErrorReporting(scope, error);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
      <div
        role="alert"
        className="w-full max-w-xl rounded-2xl border border-border bg-card p-7 text-center shadow-sm sm:p-10"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-primary">
          <Icon aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-heading text-3xl font-semibold">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
        <Button className="mt-7" onClick={onRetry}>
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
