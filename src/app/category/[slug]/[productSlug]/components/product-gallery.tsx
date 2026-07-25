"use client";

import { useState } from "react";
import Image from "next/image";

import type { WooImage } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: WooImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border bg-[#f7f7f7]">
        <div className="grid h-full place-items-center text-muted-foreground">
          Product image coming soon
        </div>
      </div>
    );
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border bg-[#f7f7f7]">
        <Image
          key={activeImage.id}
          src={activeImage.src}
          alt={activeImage.alt || productName}
          fill
          fetchPriority="high"
          sizes="(max-width: 1023px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-3" aria-label="Product images">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-pressed={index === activeIndex}
                className={cn(
                  "relative size-16 overflow-hidden rounded-lg border bg-[#f7f7f7] transition-colors sm:size-20",
                  index === activeIndex
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-foreground/40",
                )}
              >
                <Image
                  src={image.thumbnail || image.src}
                  alt={image.alt || `${productName} thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
