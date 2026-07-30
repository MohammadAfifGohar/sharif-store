"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBagIcon, Trash2Icon } from "lucide-react";

import { useBag } from "@/components/bag-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getProductPath } from "@/lib/product-route";
import { absoluteUrl } from "@/lib/site-config";
import { getWhatsAppBagOrderUrl } from "@/lib/whatsapp-order";
import { formatMoneyAmount } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

export function BagSheet() {
  const { items, removeItem, setQuantity, totalCount, subtotal } = useBag();
  const currencyCode = items[0]?.currencyCode ?? "INR";
  const subtotalDisplay = formatMoneyAmount(subtotal, currencyCode);

  const whatsAppCheckoutUrl = getWhatsAppBagOrderUrl(
    items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPriceDisplay: formatMoneyAmount(item.unitPrice, item.currencyCode),
      productUrl: absoluteUrl(getProductPath(item.categorySlug, item.slug)),
    })),
    subtotalDisplay,
  );

  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon-lg" className="relative size-11" />}
      >
        <ShoppingBagIcon />
        {totalCount > 0 ? (
          <Badge className="absolute -right-1 -top-1 h-4.5 min-w-4.5 justify-center px-1 text-[10px]">
            {totalCount}
          </Badge>
        ) : null}
        <span className="sr-only">Open bag</span>
      </SheetTrigger>

      <SheetContent side="right" className="!w-full gap-0 p-0 sm:!max-w-sm">
        <SheetHeader className="border-b border-border/70 px-6 py-6">
          <SheetTitle className="font-heading text-2xl font-semibold">
            Your bag
          </SheetTitle>
          <SheetDescription>
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
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  <Link
                    href={getProductPath(item.categorySlug, item.slug)}
                    className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted"
                  >
                    {item.image ? (
                      <Image
                        src={item.image.src}
                        alt={item.image.alt}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={getProductPath(item.categorySlug, item.slug)}
                        className="truncate text-sm font-semibold capitalize"
                      >
                        {item.name}
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.name} from bag`}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <QuantityStepper
                        size="sm"
                        quantity={item.quantity}
                        onIncrement={() =>
                          setQuantity(item.productId, item.quantity + 1)
                        }
                        onDecrement={() =>
                          setQuantity(item.productId, item.quantity - 1)
                        }
                      />
                      <span className="text-sm font-bold">
                        {formatMoneyAmount(
                          item.unitPrice * item.quantity,
                          item.currencyCode,
                        )}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <SheetFooter className="border-t border-border/70 px-6 py-6">
          <div className="mb-3 flex items-center justify-between text-sm font-semibold">
            <span>Subtotal</span>
            <span>{subtotalDisplay}</span>
          </div>
          <a
            href={whatsAppCheckoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={items.length === 0}
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full",
              items.length === 0 && "pointer-events-none opacity-50",
            )}
          >
            Checkout on WhatsApp
          </a>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
