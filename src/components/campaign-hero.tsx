"use client";

import { useEffect, useState } from "react";
import { getImageProps } from "next/image";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type CampaignImage = {
  height: number;
  src: string;
  width: number;
};

export type CampaignSlide = {
  alt: string;
  desktopImage: CampaignImage;
  href: string;
  mobileImage: CampaignImage;
};

type CampaignHeroProps = {
  slides: CampaignSlide[];
};

const ROTATION_INTERVAL = 6000;

export function CampaignHero({ slides }: CampaignHeroProps) {
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
    if (!api) {
      return;
    }

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
    if (!api || isPaused || prefersReducedMotion || slides.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      api.scrollNext();
    }, ROTATION_INTERVAL);

    return () => window.clearInterval(interval);
  }, [api, isPaused, prefersReducedMotion, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      aria-label="Featured collections"
      className="group overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <CarouselContent className="ml-0">
        {slides.map((slide, index) => {
          const common = {
            alt: slide.alt,
            fetchPriority:
              index === 0 ? ("high" as const) : ("auto" as const),
            loading: index === 0 ? ("eager" as const) : ("lazy" as const),
            quality: 85,
            sizes: "100vw",
          };
          const {
            props: { srcSet: desktopSrcSet },
          } = getImageProps({ ...common, ...slide.desktopImage });
          const { props: mobileProps } = getImageProps({
            ...common,
            ...slide.mobileImage,
          });

          return (
            <CarouselItem
              key={slide.desktopImage.src}
              aria-label={`${index + 1} of ${slides.length}: ${slide.alt}`}
              className="pl-0"
            >
              <a href={slide.href} className="block overflow-hidden">
                <picture className="block">
                  <source
                    media="(min-width: 768px)"
                    srcSet={desktopSrcSet}
                    width={slide.desktopImage.width}
                    height={slide.desktopImage.height}
                  />
                  <img
                    {...mobileProps}
                    alt={slide.alt}
                    className="block h-auto w-full"
                  />
                </picture>
              </a>
            </CarouselItem>
          );
        })}
      </CarouselContent>

      {slides.length > 1 ? (
        <>
          <CarouselPrevious
            variant="secondary"
            size="icon-lg"
            className="left-2 sm:left-5"
          />
          <CarouselNext
            variant="secondary"
            size="icon-lg"
            className="right-2 sm:right-5"
          />
          <div
            role="tablist"
            aria-label="Choose a campaign"
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-background/75 px-3 py-2 shadow-sm backdrop-blur-sm sm:bottom-5"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.desktopImage.src}
                type="button"
                role="tab"
                aria-label={`Show campaign ${index + 1}: ${slide.alt}`}
                aria-selected={index === activeIndex}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  index === activeIndex
                    ? "w-7 bg-primary"
                    : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/65",
                )}
              />
            ))}
          </div>

          <p className="sr-only" aria-live="polite">
            Campaign {activeIndex + 1} of {slides.length}:{" "}
            {slides[activeIndex]?.alt}
          </p>
        </>
      ) : null}
    </Carousel>
  );
}
