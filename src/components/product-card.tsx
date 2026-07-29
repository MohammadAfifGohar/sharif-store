import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { RatingStars } from "@/components/rating-stars";
import { SaleBadge } from "@/components/sale-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  formatPrice,
  formatRegularPrice,
  type WooProduct,
} from "@/lib/woocommerce";
import { getProductPath } from "@/lib/product-route";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: WooProduct;
  categorySlug: string;
};

function getDiscountPercent(product: WooProduct) {
  const regular = Number(product.prices.regular_price);
  const current = Number(product.prices.price);

  if (!product.on_sale || !regular || current >= regular) return 0;

  return Math.round(((regular - current) / regular) * 100);
}

export function ProductCard({ product, categorySlug }: ProductCardProps) {
  const image = product.images[0];
  const productHref = getProductPath(categorySlug, product.slug);
  const averageRating = Number(product.average_rating);
  const hasRating = product.review_count > 0 && averageRating > 0;
  const discountPercent = getDiscountPercent(product);
  const lowStock =
    product.is_in_stock &&
    typeof product.low_stock_remaining === "number" &&
    product.low_stock_remaining > 0;

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-background">
      <Link
        href={productHref}
        className="relative block aspect-[4/5] overflow-hidden bg-muted"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
              !product.is_in_stock && "opacity-60 grayscale",
            )}
          />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
            Product image coming soon
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-wrap items-center gap-1.5 sm:left-3 sm:top-3">
          {product.on_sale ? (
            <SaleBadge className="transition-transform duration-300 group-hover:scale-105" />
          ) : null}
          {discountPercent > 0 ? (
            <Badge className="bg-foreground font-bold text-background">
              {discountPercent}% OFF
            </Badge>
          ) : null}
        </div>

        {!product.is_in_stock ? (
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

      <div className="flex items-start justify-between gap-2 p-3 sm:gap-4 sm:p-4">
        <div className="min-w-0">
          <Badge variant="secondary" className="mb-1.5 max-w-full capitalize">
            <span className="truncate">
              {product.categories[0]?.name ?? "Sharif selection"}
            </span>
          </Badge>
          <h3 className="truncate font-heading text-sm font-semibold capitalize sm:text-lg">
            <Link href={productHref}>{product.name}</Link>
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 sm:mt-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm">
              <span className="font-bold">{formatPrice(product)}</span>
              {product.on_sale ? (
                <span className="text-muted-foreground line-through">
                  {formatRegularPrice(product)}
                </span>
              ) : null}
            </div>
            {hasRating ? (
              <div className="flex items-center gap-1">
                <RatingStars rating={averageRating} starClassName="size-3.5" />
                <span className="text-xs text-muted-foreground">
                  ({product.review_count})
                </span>
              </div>
            ) : null}
          </div>

          {lowStock ? (
            <p className="mt-1.5 text-[11px] font-semibold text-amber-600 sm:text-xs">
              Only {product.low_stock_remaining} left
            </p>
          ) : null}
        </div>

        <Link
          href={productHref}
          aria-label={`View ${product.name}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon-sm" }),
            "shrink-0 sm:size-8",
          )}
        >
          <ArrowUpRightIcon />
        </Link>
      </div>
    </article>
  );
}
