"use client";

import { getImageProps } from "next/image";
import Link from "next/link";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useCampaignCarousel } from "../hooks/use-campaign-carousel";

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

export function CampaignHero({ slides }: CampaignHeroProps) {
  const { activeIndex, api, pause, resume, setApi } =
    useCampaignCarousel(slides.length);

  if (slides.length === 0) {
    return null;
  }

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      aria-label="Featured collections"
      className="group overflow-hidden"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
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
              <Link
                href={slide.href}
                aria-label={`Shop ${slide.alt}`}
                className="block cursor-pointer overflow-hidden"
              >
                <picture className="block">
                  <source
                    media="(min-width: 651px)"
                    srcSet={desktopSrcSet}
                    width={slide.desktopImage.width}
                    height={slide.desktopImage.height}
                  />
                  <img
                    {...mobileProps}
                    alt={slide.alt}
                    className="block h-[min(156.25vw,80svh)] w-full object-cover object-top min-[651px]:h-auto"
                  />
                </picture>
              </Link>
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
