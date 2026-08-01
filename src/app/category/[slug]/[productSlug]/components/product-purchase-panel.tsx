"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";

import { ProductStickyCta } from "./product-sticky-cta";
import { AddToBagControl } from "@/components/add-to-bag-control";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import {
  getDefaultSelection,
  getVariationLabel,
  resolveVariation,
  type VariantAttribute,
} from "@/lib/product-variants";
import { absoluteUrl } from "@/lib/site-config";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp-order";
import {
  formatMoneyAmount,
  formatPrice,
  formatRegularPrice,
  getDiscountPercent,
  getSavingsAmount,
  type WooProduct,
} from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

type ProductPurchasePanelProps = {
  product: WooProduct;
  categorySlug: string;
  productPath: string;
  variations: WooProduct[];
  variantAttributes: VariantAttribute[];
  productPrice: string;
  regularPrice: string;
  priceRangeDisplay: string | null;
  savingsDisplay: string | null;
  isInStock: boolean;
  stockLabel: string;
  lowStockRemaining: number | null;
  whatsAppOrderUrl: string;
};

export function ProductPurchasePanel({
  product,
  categorySlug,
  productPath,
  variations,
  variantAttributes,
  productPrice,
  regularPrice,
  priceRangeDisplay,
  savingsDisplay,
  isInStock,
  stockLabel,
  lowStockRemaining,
  whatsAppOrderUrl,
}: ProductPurchasePanelProps) {
  const hasVariants = variantAttributes.length > 0;
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    hasVariants ? getDefaultSelection(variations) : {},
  );
  const resolvedVariation = resolveVariation(variations, selected);
  const priceDisplay = resolvedVariation
    ? formatPrice(resolvedVariation)
    : (priceRangeDisplay ?? productPrice);
  const regularPriceDisplay = resolvedVariation
    ? formatRegularPrice(resolvedVariation)
    : regularPrice;
  const onSale = resolvedVariation ? resolvedVariation.on_sale : product.on_sale;
  const discountPercent = getDiscountPercent(resolvedVariation ?? product);
  const resolvedSavingsDisplay = resolvedVariation
    ? (() => {
        const amount = getSavingsAmount(resolvedVariation);
        return amount > 0
          ? formatMoneyAmount(amount, resolvedVariation.prices.currency_code)
          : null;
      })()
    : savingsDisplay;
  const stockSource = resolvedVariation ?? (hasVariants ? null : product);
  const activeIsInStock = stockSource ? stockSource.is_in_stock : isInStock;
  const activeStockLabel = stockSource
    ? stockSource.is_in_stock
      ? stockSource.stock_availability?.text || "In stock"
      : "Currently out of stock"
    : stockLabel;
  const activeLowStockRemaining = stockSource
    ? typeof stockSource.low_stock_remaining === "number" &&
      stockSource.low_stock_remaining > 0
      ? stockSource.low_stock_remaining
      : null
    : lowStockRemaining;
  const variationLabel = getVariationLabel(product, selected);
  const activeWhatsAppUrl = resolvedVariation
    ? getWhatsAppOrderUrl({
        productName: variationLabel
          ? `${product.name} (${variationLabel})`
          : product.name,
        price: priceDisplay,
        productUrl: absoluteUrl(productPath),
      })
    : whatsAppOrderUrl;
  const variation = resolvedVariation
    ? {
        id: resolvedVariation.id,
        label: variationLabel,
        priceSource: resolvedVariation,
      }
    : null;

  return (
    <>
      <div className="mt-5 flex flex-wrap items-baseline gap-3 text-lg sm:text-xl">
        <span className="font-bold">
          {priceDisplay}
          {resolvedSavingsDisplay ? (
            <span className="ml-1.5 text-sm font-bold text-emerald-600">
              · Save {resolvedSavingsDisplay}
            </span>
          ) : null}
        </span>
        {onSale ? (
          <span className="text-muted-foreground line-through">
            {regularPriceDisplay}
          </span>
        ) : null}
        {discountPercent > 0 ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-600/15 sm:text-sm">
            {discountPercent}% OFF
          </span>
        ) : null}
      </div>

      {hasVariants ? (
        <div className="mt-5 space-y-4">
          {variantAttributes.map((attribute) => (
            <div key={attribute.name}>
              <p className="mb-2 text-sm font-semibold">{attribute.name}</p>
              <div className="flex flex-wrap gap-2">
                {attribute.terms.map((term) => {
                  const key = attribute.name.toLowerCase();
                  const isSelected = selected[key] === term;
                  return (
                    <button
                      key={term}
                      type="button"
                      onClick={() =>
                        setSelected((current) => ({ ...current, [key]: term }))
                      }
                      aria-pressed={isSelected}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-foreground/40",
                      )}
                    >
                      {term}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <p
        className={cn(
          "my-6 flex items-center gap-2 text-sm font-semibold",
          !activeIsInStock && "text-destructive",
        )}
      >
        <CheckIcon className="size-4" />
        {activeStockLabel}
        {activeIsInStock && activeLowStockRemaining ? (
          <span className="font-normal text-muted-foreground">
            ({activeLowStockRemaining} left)
          </span>
        ) : null}
      </p>

      <div className="flex items-center gap-3">
        <AddToBagControl
          product={product}
          categorySlug={categorySlug}
          variation={variation}
          className="h-11 min-w-0 flex-1 rounded-xl"
          quantityClassName="w-28 flex-none sm:w-44"
        />
        <a
          href={activeWhatsAppUrl}
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
        priceDisplay={priceDisplay}
        savingsDisplay={resolvedSavingsDisplay}
        variation={variation}
      />
    </>
  );
}
