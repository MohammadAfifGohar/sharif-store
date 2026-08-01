"use client";

import { ShoppingBagIcon } from "lucide-react";

import { useBag } from "@/components/bag-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import type { WooProduct } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

type AddToBagControlProps = {
  product: WooProduct;
  categorySlug: string;
  size?: "sm" | "lg";
  className?: string;
  quantityClassName?: string;
};

export function AddToBagControl({
  product,
  categorySlug,
  size = "lg",
  className,
  quantityClassName,
}: AddToBagControlProps) {
  const { items, addItem, setQuantity } = useBag();
  const bagItem = items.find((line) => line.productId === product.id);
  const disabled = !product.is_in_stock;

  if (bagItem) {
    return (
      <QuantityStepper
        size={size}
        className={cn(className, quantityClassName)}
        quantity={bagItem.quantity}
        disabled={disabled}
        onIncrement={() => setQuantity(product.id, bagItem.quantity + 1)}
        onDecrement={() => setQuantity(product.id, bagItem.quantity - 1)}
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
        onClick={() => addItem(product, categorySlug, 1)}
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
      onClick={() => addItem(product, categorySlug, 1)}
      className={cn(buttonVariants({ size: "lg" }), "w-full", className)}
    >
      <ShoppingBagIcon data-icon="inline-start" />
      Add to Bag
    </button>
  );
}
