"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "@/components/product-card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { ProductCardVariant } from "@/lib/product-variants";
import type { WooProduct } from "@/lib/woocommerce";

export type RelatedCarouselItem = {
  product: WooProduct;
  variants: ProductCardVariant[];
};

type RelatedProductsCarouselProps = {
  items: RelatedCarouselItem[];
};

export function RelatedProductsCarousel({
  items,
}: RelatedProductsCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    if (!api) return;

    const update = () => setCanScroll(api.canScrollPrev() || api.canScrollNext());
    update();
    api.on("select", update);
    api.on("reInit", update);

    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start", slidesToScroll: "auto" }}
      className="w-full"
    >
      <CarouselContent className="-ml-3 sm:-ml-5">
        {items.map((item) => (
          <CarouselItem
            key={item.product.id}
            className="basis-3/5 pl-3 sm:basis-1/2 sm:pl-5 md:basis-1/3 lg:basis-1/4"
          >
            <ProductCard
              product={item.product}
              categorySlug={item.product.categories[0].slug}
              variants={item.variants}
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      {canScroll ? (
        <>
          <CarouselPrevious className="left-2 flex border-border bg-background/85 shadow-md backdrop-blur-sm" />
          <CarouselNext className="right-2 flex border-border bg-background/85 shadow-md backdrop-blur-sm" />
        </>
      ) : null}
    </Carousel>
  );
}
