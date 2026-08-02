"use client";

import { useEffect, useRef, useState } from "react";

import { AddToBagControl } from "@/components/add-to-bag-control";
import type { BagVariation } from "@/lib/bag";
import type { WooProduct } from "@/lib/woocommerce";

type ProductStickyCtaProps = {
  product: WooProduct;
  categorySlug: string;
  priceDisplay: string;
  regularPriceDisplay?: string | null;
  savingsDisplay: string | null;
  discountPercent?: number;
  variation?: BagVariation | null;
};

/**
 * Renders an invisible sentinel right after the main CTA row, then shows a
 * fixed bottom bar (mobile only) once that row has scrolled out of view —
 * so the add-to-bag action stays reachable on long product pages.
 */
export function ProductStickyCta({
  product,
  categorySlug,
  priceDisplay,
  regularPriceDisplay = null,
  savingsDisplay,
  discountPercent = 0,
  variation = null,
}: ProductStickyCtaProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isCtaOffscreen, setIsCtaOffscreen] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsCtaOffscreen(!entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />

      {isCtaOffscreen ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-[1440px] items-center gap-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-bold">
                {priceDisplay}
              </span>
              {regularPriceDisplay || savingsDisplay || discountPercent > 0 ? (
                <span className="flex flex-wrap items-center gap-x-1.5 truncate text-xs">
                  {regularPriceDisplay ? (
                    <span className="font-medium text-muted-foreground line-through">
                      MRP {regularPriceDisplay}
                    </span>
                  ) : null}
                  {savingsDisplay ? (
                    <span className="font-bold text-emerald-600">
                      Save {savingsDisplay}
                    </span>
                  ) : null}
                  {discountPercent > 0 ? (
                    <span className="font-bold text-emerald-600">
                      {discountPercent}% OFF
                    </span>
                  ) : null}
                </span>
              ) : null}
            </span>
            <AddToBagControl
              product={product}
              categorySlug={categorySlug}
              variation={variation}
              className="flex-[2]"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
