"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import type { WooProduct } from "@/lib/woocommerce";

type ProductVariantContextValue = {
  variations: WooProduct[];
  selectedId: number | null;
  setSelectedId: (id: number) => void;
};

const ProductVariantContext = createContext<ProductVariantContextValue | null>(null);

type ProductVariantProviderProps = {
  variations: WooProduct[];
  /** Variation id deep-linked from the product grid (e.g. `?variant=123`), pre-selected on load. */
  initialVariantId?: number | null;
  children: ReactNode;
};

/**
 * Holds the selected variation so the gallery and the purchase panel — which
 * sit in separate columns — stay in sync when the shopper picks a size.
 */
export function ProductVariantProvider({
  variations,
  initialVariantId = null,
  children,
}: ProductVariantProviderProps) {
  const [selectedId, setSelectedId] = useState<number | null>(
    () =>
      (initialVariantId != null
        ? variations.find((variation) => variation.id === initialVariantId)?.id
        : undefined) ??
      variations.find((variation) => variation.is_in_stock)?.id ??
      variations[0]?.id ??
      null,
  );

  return (
    <ProductVariantContext.Provider value={{ variations, selectedId, setSelectedId }}>
      {children}
    </ProductVariantContext.Provider>
  );
}

export function useProductVariant() {
  const context = useContext(ProductVariantContext);
  if (!context) {
    throw new Error("useProductVariant must be used inside ProductVariantProvider");
  }

  const selectedVariation =
    context.variations.find((variation) => variation.id === context.selectedId) ?? null;

  return { ...context, selectedVariation };
}
