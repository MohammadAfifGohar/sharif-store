"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";

import type { WooImage } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: WooImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

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
  const lensWidth = 36;
  const lensHeight = 27;
  const lensLeft = zoomPosition
    ? Math.min(100 - lensWidth, Math.max(0, zoomPosition.x - lensWidth / 2))
    : 0;
  const lensTop = zoomPosition
    ? Math.min(100 - lensHeight, Math.max(0, zoomPosition.y - lensHeight / 2))
    : 0;
  const backgroundX = (lensLeft / (100 - lensWidth)) * 100;
  const backgroundY = (lensTop / (100 - lensHeight)) * 100;

  function updateZoomPosition(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();

    setZoomPosition({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  }

  return (
    <div className="relative flex flex-col gap-4">
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border bg-[#f7f7f7] lg:cursor-crosshair"
        onMouseEnter={updateZoomPosition}
        onMouseMove={updateZoomPosition}
        onMouseLeave={() => setZoomPosition(null)}
      >
        <Image
          key={activeImage.id}
          src={activeImage.src}
          alt={activeImage.alt || productName}
          fill
          fetchPriority="high"
          sizes="(max-width: 1023px) 100vw, 50vw"
          className="object-cover"
        />

        {zoomPosition ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute hidden border border-foreground/20 bg-background/35 shadow-sm backdrop-blur-[1px] lg:block"
            style={{
              width: `${lensWidth}%`,
              height: `${lensHeight}%`,
              left: `${lensLeft}%`,
              top: `${lensTop}%`,
            }}
          />
        ) : null}
      </div>

      {zoomPosition ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[calc(100%+3rem)] top-0 z-30 hidden aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background bg-no-repeat shadow-2xl lg:block"
          style={{
            backgroundImage: `url(${JSON.stringify(activeImage.src)})`,
            backgroundPosition: `${backgroundX}% ${backgroundY}%`,
            backgroundSize: `${10000 / lensWidth}% ${10000 / lensHeight}%`,
          }}
        />
      ) : null}

      <p className="hidden items-center gap-2 text-xs font-medium text-muted-foreground lg:flex">
        <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
        Hover over the image to zoom
      </p>

      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-3" aria-label="Product images">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  setZoomPosition(null);
                }}
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
