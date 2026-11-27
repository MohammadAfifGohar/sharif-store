"use client";

import { ZapIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { useBag } from "@/components/bag-provider";
import { buttonVariants } from "@/components/ui/button";
import type { BagVariation } from "@/lib/bag";
import type { WooProduct } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

type BuyNowButtonProps = {
  product: WooProduct;
  categorySlug: string;
  variation?: BagVariation | null;
  className?: string;
};

/**
 * Puts the product in the bag (once — a product already there keeps its
 * quantity) and goes straight to checkout. Anything else in the bag stays.
 */
export function BuyNowButton({
  product,
  categorySlug,
  variation = null,
  className,
}: BuyNowButtonProps) {
  const { items, addItem } = useBag();
  const router = useRouter();
  const variationId = variation?.id ?? null;

  function buyNow() {
    const inBag = items.some(
      (line) => line.productId === product.id && line.variationId === variationId,
    );
    if (!inBag) addItem(product, categorySlug, 1, variation ?? undefined);
    router.push("/checkout");
  }

  return (
    <button
      type="button"
      disabled={!product.is_in_stock}
      onClick={buyNow}
      onMouseEnter={() => router.prefetch("/checkout")}
      className={cn(buttonVariants({ size: "lg" }), "w-full", className)}
    >
      <ZapIcon data-icon="inline-start" />
      Buy Now
    </button>
  );
}
