"use client";

import { ShoppingBagIcon } from "lucide-react";

import { useBag } from "@/components/bag-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import type { BagVariation } from "@/lib/bag";
import type { WooProduct } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

type AddToBagControlProps = {
  product: WooProduct;
  categorySlug: string;
  size?: "sm" | "lg";
  className?: string;
  /** Set when this control represents one specific variation of a variable product. */
  variation?: BagVariation | null;
};

export function AddToBagControl({
  product,
  categorySlug,
  size = "lg",
  className,
  variation = null,
}: AddToBagControlProps) {
  const { items, addItem, setQuantity } = useBag();
  const variationId = variation?.id ?? null;
  const bagItem = items.find(
    (line) => line.productId === product.id && line.variationId === variationId,
  );
  const disabled = !product.is_in_stock;

  if (bagItem) {
    return (
      <QuantityStepper
        size={size}
        className={className}
        quantity={bagItem.quantity}
        disabled={disabled}
        onIncrement={() =>
          setQuantity(product.id, variationId, bagItem.quantity + 1)
        }
        onDecrement={() =>
          setQuantity(product.id, variationId, bagItem.quantity - 1)
        }
      />
    );
  }

  if (size === "sm") {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={disabled}
        onClick={() => addItem(product, categorySlug, 1, variation ?? undefined)}
        aria-label={`Add ${product.name} to bag`}
        className={cn("shrink-0 sm:size-8", className)}
      >
        <ShoppingBagIcon />
      </Button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => addItem(product, categorySlug, 1, variation ?? undefined)}
      className={cn(buttonVariants({ size: "lg" }), "w-full", className)}
    >
      <ShoppingBagIcon data-icon="inline-start" />
      Add to Bag
    </button>
  );
}
