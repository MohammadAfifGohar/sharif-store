import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  formatPrice,
  formatRegularPrice,
  type WooProduct,
} from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: WooProduct;
  index: number;
};

export function ProductCard({ product, index }: ProductCardProps) {
  const image = product.images[0];

  return (
    <Reveal delay={index * 0.07}>
      <article className="group">
        <a
          href={product.permalink}
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
            <Badge className="absolute left-3 top-3" variant="secondary">
              Sale
            </Badge>
          ) : null}
        </a>

        <div className="flex items-start justify-between gap-4 pt-4">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {product.categories[0]?.name ?? "Sharif selection"}
            </p>
            <h3 className="truncate font-heading text-lg font-semibold capitalize">
              <a href={product.permalink}>{product.name}</a>
            </h3>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="font-bold">{formatPrice(product)}</span>
              {product.on_sale ? (
                <span className="text-muted-foreground line-through">
                  {formatRegularPrice(product)}
                </span>
              ) : null}
            </div>
          </div>

          <a
            href={product.permalink}
            aria-label={`View ${product.name}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "shrink-0",
            )}
          >
            <ArrowUpRightIcon />
          </a>
        </div>
      </article>
    </Reveal>
  );
}
