"use client";

import { ZapIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import type { BagVariation } from "@/lib/bag";
import { startBuyNow } from "@/lib/buy-now-store";
import type { WooProduct } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

type BuyNowButtonProps = {
  product: WooProduct;
  categorySlug: string;
  variation?: BagVariation | null;
  className?: string;
};

export const BUY_NOW_CHECKOUT_PATH = "/checkout?buy=now";

/**
 * Goes straight to checkout with only this product. The bag is not touched,
 * so whatever the shopper saved there stays for later.
 */
export function BuyNowButton({
  product,
  categorySlug,
  variation = null,
  className,
}: BuyNowButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={!product.is_in_stock}
      onClick={() => {
        startBuyNow(product, categorySlug, variation ?? undefined);
        router.push(BUY_NOW_CHECKOUT_PATH);
      }}
      onMouseEnter={() => router.prefetch(BUY_NOW_CHECKOUT_PATH)}
      className={cn(buttonVariants({ size: "lg" }), "w-full", className)}
    >
      <ZapIcon data-icon="inline-start" />
      Buy Now
    </button>
  );
}
