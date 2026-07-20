"use client";

import { useEffect, useState } from "react";

import type { CarouselApi } from "@/components/ui/carousel";

const ROTATION_INTERVAL = 6000;

export function useCampaignCarousel(slideCount: number) {
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(query.matches);

    updatePreference();
    query.addEventListener("change", updatePreference);

    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!api) return;

    const updateActiveIndex = () => setActiveIndex(api.selectedScrollSnap());

    updateActiveIndex();
    api.on("select", updateActiveIndex);
    api.on("reInit", updateActiveIndex);

    return () => {
      api.off("select", updateActiveIndex);
      api.off("reInit", updateActiveIndex);
    };
  }, [api]);

  useEffect(() => {
    if (!api || isPaused || prefersReducedMotion || slideCount < 2) return;

    const interval = window.setInterval(() => {
      api.scrollNext();
    }, ROTATION_INTERVAL);

    return () => window.clearInterval(interval);
  }, [api, isPaused, prefersReducedMotion, slideCount]);

  return {
    activeIndex,
    api,
    pause: () => setIsPaused(true),
    resume: () => setIsPaused(false),
    setApi,
  };
}
