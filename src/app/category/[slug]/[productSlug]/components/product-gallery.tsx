"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { BadgePercentIcon } from "lucide-react";

import type { WooImage } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  discountPercent?: number;
  images: WooImage[];
  productName: string;
};

export function ProductGallery({
  discountPercent = 0,
  images,
  productName,
}: ProductGalleryProps) {
  // A single image has nothing to snap between, so drag/swipe stays off (#17).
  const canSwipe = images.length > 1;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
    watchDrag: canSwipe,
    // Embla animates via spring physics, not a CSS transition — this frame
    // count is the closest equivalent to a ~300ms snap at 60fps.
    duration: 20,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const animationFrame = requestAnimationFrame(onSelect);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      cancelAnimationFrame(animationFrame);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollToIndex = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

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
        ref={emblaRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${productName} images`}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border bg-[#f7f7f7] lg:cursor-crosshair"
        style={{ touchAction: "pan-y" }}
        onMouseEnter={updateZoomPosition}
        onMouseMove={updateZoomPosition}
        onMouseLeave={() => setZoomPosition(null)}
      >
        <div className="flex h-full">
          {images.map((image, index) => (
            <div
              key={image.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Image ${index + 1} of ${images.length}`}
              aria-hidden={index !== activeIndex}
              className="relative h-full w-full shrink-0 grow-0 basis-full"
            >
              <Image
                src={image.src}
                alt={image.alt || productName}
                fill
                fetchPriority={index === 0 ? "high" : undefined}
                loading={index === 0 ? undefined : "lazy"}
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

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
                  scrollToIndex(index);
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
