"use client";

import { useRef, useState, type MouseEvent, type TouchEvent } from "react";
import Image from "next/image";
import { BadgePercentIcon } from "lucide-react";

import type { WooImage } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  discountPercent?: number;
  images: WooImage[];
  productName: string;
};

const SWIPE_THRESHOLD_PX = 40;

export function ProductGallery({
  discountPercent = 0,
  images,
  productName,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const touchStartXRef = useRef<number | null>(null);

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

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null) return;

    const deltaX = event.changedTouches[0].clientX - startX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;

    setActiveIndex((current) =>
      deltaX < 0
        ? Math.min(images.length - 1, current + 1)
        : Math.max(0, current - 1),
    );
    setZoomPosition(null);
  }

  return (
    <div className="relative flex flex-col gap-4">
      <div
        className="relative aspect-[3/4] w-full touch-pan-y overflow-hidden rounded-2xl border border-border bg-[#f7f7f7] lg:cursor-crosshair"
        onMouseEnter={updateZoomPosition}
        onMouseMove={updateZoomPosition}
        onMouseLeave={() => setZoomPosition(null)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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

        {discountPercent > 0 ? (
          <div className="pointer-events-none absolute left-0 top-4 z-10 flex items-center gap-2 rounded-r-xl border-y border-r border-white/60 bg-[#df1748] py-2 pl-2.5 pr-3 text-white shadow-[0_8px_24px_rgba(125,14,49,0.3)] sm:top-5 sm:gap-2.5 sm:py-2.5 sm:pl-3 sm:pr-4">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/18 ring-1 ring-white/30 sm:size-8">
              <BadgePercentIcon aria-hidden="true" className="size-4 sm:size-[18px]" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/80 sm:text-[9px]">
                Limited offer
              </span>
              <strong className="mt-1 text-sm font-black tracking-wide sm:text-base">
                {discountPercent}% OFF
              </strong>
            </span>
          </div>
        ) : null}

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
