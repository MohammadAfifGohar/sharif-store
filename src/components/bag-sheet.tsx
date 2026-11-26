"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBagIcon, Trash2Icon } from "lucide-react";

import { useBag } from "@/components/bag-provider";
import { CouponPanel } from "@/components/coupon-panel";
import { DeliveryPinField } from "@/components/delivery-pin-field";
import { FreeShippingProgress } from "@/components/free-shipping-progress";
import { LinePrice } from "@/components/line-price";
import { OrderTotalRow, SavingsBanner } from "@/components/order-total";
import { ShippingSummary } from "@/components/shipping-summary";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCoupon } from "@/hooks/use-coupon";
import { useShippingRules } from "@/hooks/use-shipping-rules";
import { getBagRegularTotal } from "@/lib/bag";
import { getOrderTotals } from "@/lib/checkout";
import { useDeliveryPin } from "@/lib/delivery-pin";
import { getProductPath } from "@/lib/product-route";
import { getFreeShippingThreshold } from "@/lib/shipping";
import { formatMoneyAmount } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

export function BagSheet() {
  const { items, removeItem, setQuantity, totalCount, subtotal } = useBag();
  const { coupon } = useCoupon(items);
  const currencyCode = items[0]?.currencyCode ?? "INR";
  const regularTotal = getBagRegularTotal(items);
  const deliveryPin = useDeliveryPin();
  const shipping = useShippingRules({ postcode: deliveryPin || undefined });
  const totals = getOrderTotals({ subtotal, regularTotal, coupon, prepaid: false, shipping });
  // The charge depends on the area, so without a PIN code it is left out.
  const shippingFee = deliveryPin ? totals.shippingFee : null;
  const total = totals.total - (shippingFee === null ? totals.shippingFee : 0);

  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon-lg" className="relative size-11" />}
      >
        <ShoppingBagIcon />
        {totalCount > 0 ? (
          <Badge className="absolute right-0 top-0 h-4 min-w-4 justify-center px-0.5 text-[9px] leading-none">
            {totalCount}
          </Badge>
        ) : null}
        <span className="sr-only">Open bag</span>
      </SheetTrigger>

      <SheetContent side="right" className="!w-full gap-0 p-0 sm:!max-w-md">
        <SheetHeader className="border-b border-border/70 px-6 py-5">
          <SheetTitle className="font-heading text-2xl font-semibold">
            Your bag
            {totalCount > 0 ? (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({totalCount} item{totalCount === 1 ? "" : "s"})
              </span>
            ) : null}
          </SheetTitle>
          <SheetDescription className={cn(totalCount > 0 && "sr-only")}>
            {totalCount > 0
              ? `${totalCount} item${totalCount === 1 ? "" : "s"} in your bag`
              : "Add products to see them here."}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center text-muted-foreground">
            <ShoppingBagIcon className="size-8" />
            <p className="text-sm">Your bag is empty.</p>
          </div>
        ) : (
          <>
            {deliveryPin && getFreeShippingThreshold(shipping) !== null ? (
              <div className="border-b border-border/70 bg-muted/30 px-6 py-4">
                <FreeShippingProgress
                  shipping={shipping}
                  subtotal={subtotal}
                  itemsTotal={totals.itemsTotal}
                  shippingFee={totals.shippingFee}
                  currencyCode={currencyCode}
                />
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.variationId ?? "base"}`}
                    className="flex gap-3 rounded-xl border border-border/70 p-3"
                  >
                    <Link
                      href={getProductPath(item.categorySlug, item.slug)}
                      className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
                    >
                      {item.image ? (
                        <Image
                          src={item.image.src}
                          alt={item.image.alt}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={getProductPath(item.categorySlug, item.slug)}
                            className="line-clamp-2 text-sm font-semibold capitalize"
                          >
                            {item.name}
                          </Link>
                          {item.variationLabel ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {item.variationLabel}
                            </p>
                          ) : null}
                        </div>
                        <LinePrice item={item} className="shrink-0" />
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-2">
                        <QuantityStepper
                          size="sm"
                          quantity={item.quantity}
                          onIncrement={() =>
                            setQuantity(item.productId, item.variationId, item.quantity + 1)
                          }
                          onDecrement={() =>
                            setQuantity(item.productId, item.variationId, item.quantity - 1)
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeItem(item.productId, item.variationId)}
                          aria-label={`Remove ${item.name} from bag`}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <CouponPanel
                items={items}
                subtotal={subtotal}
                currencyCode={currencyCode}
                className="mt-4"
              />

              <DeliveryPinField className="mt-3" />
            </div>
          </>
        )}

        <SheetFooter className="relative border-t border-border/70 px-6 pb-6 pt-5">
          {items.length > 0 ? (
            <>
              <SavingsBanner
                amount={totals.totalSavings}
                currencyCode={currencyCode}
                className="absolute inset-x-6 -top-3.5"
              />
              <div className="mb-3 flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoneyAmount(subtotal, currencyCode)}</span>
                </div>
                {totals.couponDiscount ? (
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                    <span>Coupon ({coupon?.code.toUpperCase()})</span>
                    <span>−{formatMoneyAmount(totals.couponDiscount, currencyCode)}</span>
                  </div>
                ) : null}
                <ShippingSummary fee={shippingFee} currencyCode={currencyCode} />
                <OrderTotalRow
                  label="Total"
                  total={total}
                  regularTotal={regularTotal + (shippingFee ?? 0)}
                  currencyCode={currencyCode}
                />
                {totals.prepaidDiscount ? (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Pay online at checkout and save{" "}
                    {formatMoneyAmount(totals.prepaidDiscount, currencyCode)} more.
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
          <SheetClose
            nativeButton={false}
            render={
              <Link
                href="/checkout"
                aria-disabled={items.length === 0}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full",
                  items.length === 0 && "pointer-events-none opacity-50",
                )}
              />
            }
          >
            Checkout
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
