"use client";

import { ProductGallery } from "./product-gallery";
import { useProductVariant } from "./product-variant-context";
import type { WooImage } from "@/lib/woocommerce";

type ProductVariantGalleryProps = {
  images: WooImage[];
  productName: string;
  discountPercent?: number;
};

/**
 * Product gallery that leads with the selected variation's own image (e.g. the
 * 100ml bottle), followed by the parent product's images.
 */
export function ProductVariantGallery({
  images,
  productName,
  discountPercent,
}: ProductVariantGalleryProps) {
  const { selectedId, selectedVariation } = useProductVariant();
  const variationImages = selectedVariation?.images ?? [];
  const variationImageIds = new Set(variationImages.map((image) => image.id));
  const galleryImages = [
    ...variationImages,
    ...images.filter((image) => !variationImageIds.has(image.id)),
  ];

  return (
    <ProductGallery
      // Remount on size change so the carousel resets to the variation's image.
      key={selectedId ?? "product"}
      images={galleryImages}
      productName={productName}
      discountPercent={discountPercent}
    />
  );
}
