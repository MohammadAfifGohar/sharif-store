"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { AddToBagControl } from "@/components/add-to-bag-control";
import { RatingStars } from "@/components/rating-stars";
import { SaleBadge } from "@/components/sale-badge";
import { Badge } from "@/components/ui/badge";
import type { ProductCardVariant } from "@/lib/product-variants";
import {
  formatPrice,
  formatRegularPrice,
  getDiscountPercent,
  type WooProduct,
} from "@/lib/woocommerce";
import { getProductPath } from "@/lib/product-route";
import { textFromHtml } from "@/lib/html-text";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: WooProduct;
  categorySlug: string;
  /** Every resolved variation for a variable product; empty for a simple product. */
  variants?: ProductCardVariant[];
};

export function ProductCard({
  product,
  categorySlug,
  variants = [],
}: ProductCardProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants.find((variant) => variant.data.is_in_stock)?.id ??
      variants[0]?.id ??
      null,
  );
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? null;
  const displayProduct = selectedVariant?.data ?? product;
  const image = displayProduct.images[0] ?? product.images[0];
  const productHref = selectedVariant
    ? `${getProductPath(categorySlug, product.slug)}?variant=${selectedVariant.id}`
    : getProductPath(categorySlug, product.slug);
  const averageRating = Number(product.average_rating);
  const hasRating = product.review_count > 0 && averageRating > 0;
  const discountPercent = getDiscountPercent(displayProduct);
  const description = textFromHtml(
    product.short_description || product.description,
  );
  const lowStock =
    displayProduct.is_in_stock &&
    typeof displayProduct.low_stock_remaining === "number" &&
    displayProduct.low_stock_remaining > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-[0_1px_0_rgba(31,31,31,0.03)] transition-[border-color,box-shadow] duration-300 hover:border-primary/20 hover:shadow-[0_16px_42px_rgba(91,21,55,0.09)] sm:rounded-2xl">
      <Link
        href={productHref}
        className="relative block aspect-[4/5] overflow-hidden border-b border-border/80 bg-[#f8f6f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
              !displayProduct.is_in_stock && "opacity-60 grayscale",
            )}
          />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
            Product image coming soon
          </div>
        )}

        <div className="absolute left-0 top-3 z-10 flex flex-wrap items-center gap-1.5 sm:top-4">
          {displayProduct.on_sale && discountPercent === 0 ? (
            <SaleBadge className="ml-2 transition-transform duration-300 group-hover:scale-105 sm:ml-3" />
          ) : null}
          {discountPercent > 0 ? (
            <Badge className="rounded-l-none rounded-r-lg border-y border-r border-white/60 bg-[#d9174b] py-1.5 pl-3 pr-3.5 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-[0_6px_18px_rgba(150,12,55,.3)] transition-[padding,transform] duration-300 group-hover:pr-4 sm:py-2 sm:pl-4 sm:pr-4 sm:text-xs sm:group-hover:pr-5">
              Save {discountPercent}%
            </Badge>
          ) : null}
        </div>

        {!displayProduct.is_in_stock ? (
          <div className="absolute inset-0 grid place-items-center">
            <Badge
              variant="secondary"
              className="bg-background/90 text-xs font-semibold uppercase tracking-[0.1em] shadow-sm"
            >
              Out of stock
            </Badge>
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <div className="flex flex-1 flex-col">
          <h3 className="line-clamp-2 font-heading text-sm font-semibold capitalize leading-snug text-foreground">
            <Link
              href={productHref}
              className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {product.name}
            </Link>
          </h3>

          {description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
              {description}
            </p>
          ) : null}

          {hasRating ? (
            <div className="mt-1.5 flex items-center gap-1" aria-label={`${averageRating.toFixed(1)} out of 5 stars from ${product.review_count} reviews`}>
              <RatingStars rating={averageRating} starClassName="size-3" />
              <span className="text-[10px] font-medium text-muted-foreground">
                ({product.review_count})
              </span>
            </div>
          ) : null}

          {variants.length > 0 ? (
            <div className="no-scrollbar mt-2 flex snap-x snap-mandatory gap-1.5 overflow-x-auto pb-0.5">
              {variants.map((variant) => {
                const isSelected = variant.id === selectedVariantId;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={!variant.data.is_in_stock}
                    onClick={(event) => {
                      event.preventDefault();
                      setSelectedVariantId(variant.id);
                    }}
                    aria-pressed={isSelected}
                    className={cn(
                      "shrink-0 snap-start rounded-md border px-2 py-1 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50",
                    )}
                  >
                    {variant.shortLabel}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-lg font-bold leading-none tabular-nums text-foreground">
              {formatPrice(displayProduct)}
            </span>
            {displayProduct.on_sale ? (
              <>
                <span className="text-[13px] font-normal leading-none tabular-nums text-muted-foreground line-through">
                  {formatRegularPrice(displayProduct)}
                </span>
                {discountPercent > 0 ? (
                  <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[12px] font-bold tabular-nums text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    {discountPercent}% off
                  </span>
                ) : null}
              </>
            ) : null}
          </div>

          {lowStock ? (
            <p className="mt-1.5 text-[10px] font-semibold text-amber-700">
              Only {displayProduct.low_stock_remaining} left
            </p>
          ) : null}
        </div>

        <AddToBagControl
          product={product}
          categorySlug={categorySlug}
          size="lg"
          label="Add to cart"
          className="mt-3 h-10 rounded-lg border-primary/20 bg-primary px-3 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 sm:mt-4 sm:text-sm"
          quantityClassName="mt-3 h-10 w-full rounded- sm:mt-4"
          variation={
            selectedVariant
              ? {
                  id: selectedVariant.id,
                  label: selectedVariant.label,
                  priceSource: selectedVariant.data,
                }
              : null
          }
        />
      </div>
    </article>
  );
}
