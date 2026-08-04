"use client";

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
 * Fixed bottom bar (mobile only) that keeps the price and add-to-bag action
 * reachable at all times on the product page. Always visible below `lg`.
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
  return (
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
  );
}
