"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type CategoryCarouselProps = {
  children: ReactNode;
  eyebrow: string;
  itemCount: number;
  title: string;
};

function getItems(track: HTMLDivElement) {
  return Array.from(track.children) as HTMLElement[];
}

function getItemLeft(track: HTMLDivElement, item: HTMLElement) {
  return item.offsetLeft - track.offsetLeft;
}

export function CategoryCarousel({
  children,
  eyebrow,
  itemCount,
  title,
}: CategoryCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const targetIndexRef = useRef(0);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const prefersReducedMotionRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [status, setStatus] = useState("");

  const getMetrics = useCallback(() => {
    const track = trackRef.current;

    if (!track) {
      return null;
    }

    const items = getItems(track);
    const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    const firstEndItemIndex = items.findIndex(
      (item) => getItemLeft(track, item) >= maxScrollLeft - 1,
    );
    const lastTargetIndex =
      firstEndItemIndex === -1
        ? Math.max(0, items.length - 1)
        : firstEndItemIndex;

    return { items, lastTargetIndex, maxScrollLeft, track };
  }, []);

  const syncFromScrollPosition = useCallback(() => {
    const metrics = getMetrics();

    if (!metrics || metrics.items.length === 0) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { items, lastTargetIndex, maxScrollLeft, track } = metrics;
    const closestIndex = items.reduce((closest, item, index) => {
      const closestDistance = Math.abs(
        getItemLeft(track, items[closest]) - track.scrollLeft,
      );
      const itemDistance = Math.abs(
        getItemLeft(track, item) - track.scrollLeft,
      );

      return itemDistance < closestDistance ? index : closest;
    }, 0);
    const targetIndex = Math.min(closestIndex, lastTargetIndex);

    targetIndexRef.current = targetIndex;
    setCanScrollLeft(track.scrollLeft > 1);
    setCanScrollRight(track.scrollLeft < maxScrollLeft - 1);
  }, [getMetrics]);

  const scroll = useCallback(
    (direction: -1 | 1) => {
      const metrics = getMetrics();

      if (!metrics || metrics.items.length === 0) {
        return;
      }

      const { items, lastTargetIndex, maxScrollLeft, track } = metrics;
      const firstItemWidth = items[0].getBoundingClientRect().width;
      const gap = items[1]
        ? getItemLeft(track, items[1]) - getItemLeft(track, items[0]) -
          firstItemWidth
        : 0;
      const pageSize = Math.max(
        1,
        Math.floor((track.clientWidth + gap) / (firstItemWidth + gap)),
      );
      const targetIndex = Math.min(
        lastTargetIndex,
        Math.max(0, targetIndexRef.current + direction * pageSize),
      );
      const targetLeft = Math.min(
        getItemLeft(track, items[targetIndex]),
        maxScrollLeft,
      );

      targetIndexRef.current = targetIndex;
      setCanScrollLeft(targetIndex > 0);
      setCanScrollRight(targetIndex < lastTargetIndex);
      setStatus(
        `Showing categories ${targetIndex + 1} to ${Math.min(
          itemCount,
          targetIndex + pageSize,
        )} of ${itemCount}`,
      );

      track.scrollTo({
        left: targetLeft,
        behavior: prefersReducedMotionRef.current ? "auto" : "smooth",
      });
    },
    [getMetrics, itemCount],
  );

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const updateMotionPreference = () => {
      prefersReducedMotionRef.current = reducedMotionQuery.matches;
    };
    const handleScroll = () => {
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }

      scrollEndTimerRef.current = setTimeout(syncFromScrollPosition, 120);
    };

    updateMotionPreference();
    reducedMotionQuery.addEventListener("change", updateMotionPreference);
    track.addEventListener("scroll", handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(syncFromScrollPosition);
    resizeObserver.observe(track);
    const animationFrame = requestAnimationFrame(syncFromScrollPosition);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      reducedMotionQuery.removeEventListener("change", updateMotionPreference);
      track.removeEventListener("scroll", handleScroll);

      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, [syncFromScrollPosition]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-labelledby="category-carousel-title"
    >
      <div className="mb-7 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h2
            id="category-carousel-title"
            className="mt-2 font-heading text-3xl font-semibold"
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
