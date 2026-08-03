import Image from "next/image";
import Link from "next/link";

import { AddToBagControl } from "@/components/add-to-bag-control";
import { RatingStars } from "@/components/rating-stars";
import { SaleBadge } from "@/components/sale-badge";
import { Badge } from "@/components/ui/badge";
import type { ProductCardVariant } from "@/lib/product-variants";
import {
  formatMoneyAmount,
  formatPrice,
  formatRegularPrice,
  getDiscountPercent,
  getSavingsAmount,
  type WooProduct,
} from "@/lib/woocommerce";
import { getProductPath } from "@/lib/product-route";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: WooProduct;
  categorySlug: string;
  /** Set when this card represents one specific variation of a variable product. */
  variant?: ProductCardVariant | null;
};

export function ProductCard({ product, categorySlug, variant = null }: ProductCardProps) {
  const displayProduct = variant?.data ?? product;
  const image = displayProduct.images[0] ?? product.images[0];
  const productHref = getProductPath(categorySlug, product.slug);
  const averageRating = Number(product.average_rating);
  const hasRating = product.review_count > 0 && averageRating > 0;
  const discountPercent = getDiscountPercent(displayProduct);
  const savingsAmount = getSavingsAmount(displayProduct);
  const savingsDisplay =
    savingsAmount > 0
      ? formatMoneyAmount(savingsAmount, displayProduct.prices.currency_code)
      : null;
  const lowStock =
    displayProduct.is_in_stock &&
    typeof displayProduct.low_stock_remaining === "number" &&
    displayProduct.low_stock_remaining > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-background shadow-[0_1px_0_rgba(31,31,31,0.03)] transition-[border-color,box-shadow] duration-300 hover:border-primary/20 hover:shadow-[0_16px_42px_rgba(91,21,55,0.09)]">
      <Link
        href={productHref}
        className="relative block aspect-[4/5] overflow-hidden bg-[#f8f6f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
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

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex min-w-0">
          <Badge
            variant="secondary"
            className="h-7 max-w-full rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.06em] sm:text-xs"
          >
            <span className="truncate">
              {product.categories[0]?.name ?? "Sharif selection"}
            </span>
          </Badge>
        </div>

        <div className="mt-3 flex flex-1 flex-col sm:mt-4">
          <h3 className="line-clamp-2 font-heading text-sm font-semibold capitalize leading-[1.2] text-foreground sm:text-lg">
            <Link
              href={productHref}
              className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {product.name}
            </Link>
          </h3>

          {hasRating ? (
            <div className="mt-1.5 flex items-center gap-1.5" aria-label={`${averageRating.toFixed(1)} out of 5 stars from ${product.review_count} reviews`}>
              <RatingStars rating={averageRating} starClassName="size-3.5" />
              <span className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                ({product.review_count})
              </span>
            </div>
          ) : null}

          {variant ? (
            <p className="mt-2 w-fit rounded-md bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground sm:text-xs">
              {variant.shortLabel}
            </p>
          ) : null}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 sm:mt-3">
            <span className="text-sm font-extrabold tabular-nums sm:text-base">
              {formatPrice(displayProduct)}
            </span>
            {displayProduct.on_sale ? (
              <span className="text-[11px] font-medium tabular-nums text-muted-foreground line-through sm:text-xs">
                {formatRegularPrice(displayProduct)}
              </span>
            ) : null}
            {savingsDisplay ? (
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-emerald-700 ring-1 ring-inset ring-emerald-600/10 sm:text-[11px]">
                You save {savingsDisplay}
              </span>
            ) : null}
          </div>

          {lowStock ? (
            <p className="mt-2 text-[11px] font-semibold text-amber-700 sm:text-xs">
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
            variant
              ? {
                  id: variant.id,
                  label: variant.label,
                  priceSource: variant.data,
                }
              : null
          }
        />
      </div>
    </article>
  );
}
