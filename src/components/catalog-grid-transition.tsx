"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

const CATALOG_NAVIGATION_EVENT = "catalog:navigation-start";

export function notifyCatalogNavigation() {
  window.dispatchEvent(new Event(CATALOG_NAVIGATION_EVENT));
}

function ProductGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Updating products"
      className="mt-6 grid grid-cols-2 items-stretch gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex min-w-0 flex-col gap-3">
          <Skeleton className="aspect-[4/5] w-full rounded-xl" />
          <Skeleton className="h-4 w-4/5 rounded-sm" />
          <Skeleton className="h-4 w-2/5 rounded-sm" />
          <Skeleton className="h-8 w-full rounded-sm" />
        </div>
      ))}
      <span className="sr-only">Updating product results…</span>
    </div>
  );
}

export function CatalogGridTransition({
  navigationKey,
  children,
}: {
  navigationKey: string;
  children: ReactNode;
}) {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const showPendingGrid = () => setIsPending(true);
    window.addEventListener(CATALOG_NAVIGATION_EVENT, showPendingGrid);

    return () =>
      window.removeEventListener(CATALOG_NAVIGATION_EVENT, showPendingGrid);
  }, []);

  useEffect(() => {
    setIsPending(false);
  }, [navigationKey]);

  return isPending ? <ProductGridSkeleton /> : children;
}
