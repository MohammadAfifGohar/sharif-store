"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";

import { ProductStickyCta } from "./product-sticky-cta";
import { AddToBagControl } from "@/components/add-to-bag-control";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site-config";
import { getProductPath } from "@/lib/product-route";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp-order";
import {
  formatMoneyAmount,
  formatPrice,
  formatRegularPrice,
  getSavingsAmount,
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
  const savingsAmount = getSavingsAmount(selectedProduct);
  const savingsDisplay =
    savingsAmount > 0
      ? formatMoneyAmount(savingsAmount, selectedProduct.prices.currency_code)
      : null;
  const whatsAppOrderUrl = getWhatsAppOrderUrl({
    productName: selectedProduct.name,
    price: formatPrice(selectedProduct),
    productUrl: absoluteUrl(getProductPath(categorySlug, product.slug)),
  });
  const bagVariation = selectedVariation
    ? {
        id: selectedVariation.id,
        label: selectedLabel,
        priceSource: selectedVariation,
      }
    : null;

  return (
    <>
      <fieldset className="mt-5 rounded-2xl border border-primary/20 bg-background px-4 pb-5 pt-3 sm:px-6 sm:pb-6">
        <legend className="px-2 font-heading text-sm font-bold uppercase tracking-[0.08em] text-[#332e31] sm:text-base">
          Price
        </legend>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4">
          {selectedProduct.on_sale ? (
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <span className="font-medium text-[#5f585c]">MRP</span>
              <span className="font-medium text-muted-foreground line-through">
                {formatRegularPrice(selectedProduct)}
              </span>
            </div>
          ) : null}
          <span className="font-heading text-3xl font-extrabold tracking-tight text-[#272326] sm:text-4xl">
            {formatPrice(selectedProduct)}
          </span>
          {savingsDisplay ? (
            <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white sm:text-sm">
              Save {savingsDisplay}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
          (incl. of all taxes)
        </p>
      </fieldset>

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

      <div
        className={cn(
          "my-5 flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ring-1 ring-inset",
          isInStock
            ? "bg-emerald-50 text-emerald-800 ring-emerald-600/15"
            : "bg-destructive/10 text-destructive ring-destructive/20",
        )}
      >
        <span
          className={cn(
            "grid size-5 place-items-center rounded-full",
            isInStock ? "bg-emerald-600 text-white" : "bg-destructive text-white",
          )}
        >
          <CheckIcon className="size-3.5" strokeWidth={3} />
        </span>
        {isInStock
          ? selectedProduct.stock_availability?.text || "In stock"
          : "Currently out of stock"}
        {isInStock && selectedProduct.low_stock_remaining ? (
          <span className="font-medium opacity-75">
            ({selectedProduct.low_stock_remaining} left)
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <AddToBagControl
          product={product}
          categorySlug={categorySlug}
          variation={bagVariation}
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

      <ProductStickyCta
        product={product}
        categorySlug={categorySlug}
        priceDisplay={formatPrice(selectedProduct)}
        regularPriceDisplay={
          selectedProduct.on_sale ? formatRegularPrice(selectedProduct) : null
        }
        savingsDisplay={null}
        discountPercent={discountPercent}
        variation={bagVariation}
      />
    </>
  );
}
