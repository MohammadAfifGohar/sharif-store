"use client";

import type { ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCategoryCarousel } from "../hooks/use-category-carousel";

type CategoryCarouselProps = {
  children: ReactNode;
  eyebrow: string;
  itemCount: number;
  title: string;
};

export function CategoryCarousel({
  children,
  eyebrow,
  itemCount,
  title,
}: CategoryCarouselProps) {
  const { canScrollLeft, canScrollRight, scroll, status, trackRef } =
    useCategoryCarousel(itemCount);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-labelledby="category-carousel-title"
    >
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7 sm:gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h2
            id="category-carousel-title"
            className="mt-2 font-heading text-2xl font-semibold sm:text-3xl"
          >
            {title}
          </h2>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-full"
            aria-label="Show previous categories"
            disabled={!canScrollLeft}
            onClick={() => scroll(-1)}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-full"
            aria-label="Show next categories"
            disabled={!canScrollRight}
            onClick={() => scroll(1)}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <div
        ref={trackRef}
        data-slot="category-track"
        className="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain pb-3"
      >
        {children}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {status}
      </p>
    </div>
  );
}
