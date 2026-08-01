"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";

import { AddToBagControl } from "@/components/add-to-bag-control";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { absoluteUrl } from "@/lib/site-config";
import { getProductPath } from "@/lib/product-route";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp-order";
import {
  formatPrice,
  formatRegularPrice,
  type WooProduct,
} from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

type ProductPurchasePanelProps = {
  categorySlug: string;
  product: WooProduct;
  variations: WooProduct[];
};

function getVariationLabel(variation: WooProduct) {
  const attributeTerms = variation.attributes.flatMap((attribute) =>
    attribute.terms.map((term) => term.name),
  );

  if (attributeTerms.length > 0) return attributeTerms.join(" / ");

  const [, value] = variation.variation?.split(":") ?? [];
  return value?.trim() || variation.name;
}

export function ProductPurchasePanel({
  categorySlug,
  product,
  variations,
}: ProductPurchasePanelProps) {
  const [selectedId, setSelectedId] = useState(
    variations.find((variation) => variation.is_in_stock)?.id ??
      variations[0]?.id ??
      null,
  );
  const selectedVariation =
    variations.find((variation) => variation.id === selectedId) ?? null;
  const selectedLabel = selectedVariation
    ? getVariationLabel(selectedVariation)
    : "";
  const selectedProduct: WooProduct = selectedVariation
    ? {
        ...selectedVariation,
        name: `${product.name} — ${selectedLabel}`,
        slug: product.slug,
        categories: product.categories,
        images:
          selectedVariation.images.length > 0
            ? selectedVariation.images
            : product.images,
      }
    : product;
  const isInStock = selectedProduct.is_in_stock;
  const regularPriceAmount = Number(selectedProduct.prices.regular_price);
  const currentPriceAmount = Number(selectedProduct.prices.price);
  const discountPercent =
    selectedProduct.on_sale &&
    regularPriceAmount > 0 &&
    currentPriceAmount < regularPriceAmount
      ? Math.round(
          ((regularPriceAmount - currentPriceAmount) / regularPriceAmount) *
            100,
        )
      : 0;
  const whatsAppOrderUrl = getWhatsAppOrderUrl({
    productName: selectedProduct.name,
    price: formatPrice(selectedProduct),
    productUrl: absoluteUrl(getProductPath(categorySlug, product.slug)),
  });

  return (
    <>
      <div className="mt-5 flex items-baseline gap-3 text-lg sm:text-xl">
        <span className="font-bold">{formatPrice(selectedProduct)}</span>
        {selectedProduct.on_sale ? (
          <span className="text-muted-foreground line-through">
            {formatRegularPrice(selectedProduct)}
          </span>
        ) : null}
        {discountPercent > 0 ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-600/15 sm:text-sm">
            {discountPercent}% OFF
          </span>
        ) : null}
      </div>

      {variations.length > 0 ? (
        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Choose size</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {variations.map((variation) => {
              const isSelected = variation.id === selectedId;

              return (
                <button
                  key={variation.id}
                  type="button"
                  disabled={!variation.is_in_stock}
                  onClick={() => setSelectedId(variation.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "min-w-20 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/50",
                  )}
                >
                  {getVariationLabel(variation)}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <Separator className="my-6" />
      <p
        className={cn(
          "my-6 flex items-center gap-2 text-sm font-semibold",
          !isInStock && "text-destructive",
        )}
      >
        <CheckIcon className="size-4" />
        {isInStock
          ? selectedProduct.stock_availability?.text || "In stock"
          : "Currently out of stock"}
        {isInStock && selectedProduct.low_stock_remaining ? (
          <span className="font-normal text-muted-foreground">
            ({selectedProduct.low_stock_remaining} left)
          </span>
        ) : null}
      </p>

      <div className="flex items-center gap-3">
        <AddToBagControl
          product={selectedProduct}
          categorySlug={categorySlug}
          className="h-11 min-w-0 flex-1 rounded-xl"
          quantityClassName="w-28 flex-none sm:w-44"
        />
        <a
          href={whatsAppOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 min-w-0 flex-1 rounded-xl bg-[#25D366] px-3 font-semibold text-white shadow-sm hover:bg-[#20bd5a]",
          )}
        >
          <WhatsAppIcon data-icon="inline-start" className="text-white" />
          Order on WhatsApp
        </a>
      </div>
    </>
  );
}
