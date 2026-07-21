import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { SaleBadge } from "@/components/sale-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  formatPrice,
  formatRegularPrice,
  type WooProduct,
} from "@/lib/woocommerce";
import { getProductPath } from "@/lib/product-route.mjs";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: WooProduct;
  categorySlug: string;
};

export function ProductCard({ product, categorySlug }: ProductCardProps) {
  const image = product.images[0];
  const productHref = getProductPath(categorySlug, product.slug);

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
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
            Product image coming soon
          </div>
        )}

        {product.on_sale ? (
          <SaleBadge className="absolute left-2 top-2 transition-transform duration-300 group-hover:scale-105 sm:left-3 sm:top-3" />
        ) : null}
      </Link>

      <div className="flex items-start justify-between gap-2 p-3 sm:gap-4 sm:p-4">
        <div className="min-w-0">
          <p className="mb-1 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.14em]">
            {product.categories[0]?.name ?? "Sharif selection"}
          </p>
          <h3 className="truncate font-heading text-sm font-semibold capitalize sm:text-lg">
            <Link href={productHref}>{product.name}</Link>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:mt-2 sm:text-sm">
            <span className="font-bold">{formatPrice(product)}</span>
            {product.on_sale ? (
              <span className="text-muted-foreground line-through">
                {formatRegularPrice(product)}
              </span>
            ) : null}
          </div>
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
