"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import { ChevronDownIcon, LoaderCircleIcon, TagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCoupon } from "@/hooks/use-coupon";
import type { BagItem } from "@/lib/bag";
import type { CouponOffer } from "@/lib/coupons";
import {
  applyCoupon,
  clearCouponError,
  loadCouponOffers,
  removeCoupon,
} from "@/lib/coupon-store";
import { formatMoneyAmount } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

/**
 * Coupon entry for the bag and checkout: the applied coupon, the store's
 * advertised offers (one tap to apply) and a field for any other code.
 */
export function CouponPanel({
  items,
  subtotal,
  currencyCode,
  getEmail,
  disabled = false,
  className,
}: {
  items: BagItem[];
  subtotal: number;
  currencyCode: string;
  /** Checkout passes the email typed so far, for email-restricted coupons. */
  getEmail?: () => string;
  disabled?: boolean;
  className?: string;
}) {
  const { coupon, pendingCode, error, offers } = useCoupon(items);
  const [code, setCode] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showOffers, setShowOffers] = useState(false);

  useEffect(() => {
    void loadCouponOffers();
  }, []);

  const busy = disabled || pendingCode !== null;

  async function apply(value: string) {
    const applied = await applyCoupon(value, items, getEmail?.() || undefined);
    if (applied) {
      setCode("");
      setShowInput(false);
      setShowOffers(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Inside the checkout form, Enter must apply the coupon, not place the order.
    if (event.key === "Enter") {
      event.preventDefault();
      void apply(code);
    }
  }

  const availableOffers = offers ?? [];
  const topOffer =
    availableOffers.find((offer) => offer.minimumAmount <= subtotal) ?? availableOffers[0];

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {coupon ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-600/40 bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
          <div className="flex min-w-0 items-center gap-3">
            <TagIcon className="size-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold uppercase">{coupon.code} applied</p>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                {coupon.discount > 0
                  ? `You save ${formatMoneyAmount(coupon.discount, currencyCode)}`
                  : null}
                {coupon.discount > 0 && coupon.freeShipping ? " + " : null}
                {coupon.freeShipping ? "Free shipping" : null}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            disabled={busy}
            className="text-xs font-semibold underline underline-offset-4"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-background">
          {topOffer ? (
            <OfferRow
              offer={topOffer}
              subtotal={subtotal}
              currencyCode={currencyCode}
              pendingCode={pendingCode}
              disabled={busy}
              onApply={apply}
              className="px-4 py-3"
            />
          ) : null}

          <div className={cn("px-4 py-3", topOffer && "border-t border-border")}>
            <button
              type="button"
              onClick={() => {
                setShowInput((open) => !open);
                clearCouponError();
              }}
              aria-expanded={showInput}
              className="flex w-full items-center justify-between text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                {topOffer ? null : <TagIcon className="size-4" />}
                Enter coupon code
              </span>
              <ChevronDownIcon
                className={cn("size-4 transition-transform", showInput && "rotate-180")}
              />
            </button>
            {showInput ? (
              <div className="mt-3 flex gap-2">
                <Input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Coupon code"
                  aria-label="Coupon code"
                  autoComplete="off"
                  autoCapitalize="characters"
                  maxLength={50}
                  disabled={busy}
                  className="h-10 rounded-sm uppercase placeholder:normal-case focus-visible:ring-1!"
                />
                <Button
                  type="button"
                  onClick={() => void apply(code)}
                  disabled={busy}
                  className="h-10 px-5"
                >
                  {pendingCode && pendingCode === code.trim().toLowerCase() ? (
                    <LoaderCircleIcon className="animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
            ) : null}
          </div>

          {availableOffers.length > 1 ? (
            <div className="border-t border-border px-4 py-3">
              <button
                type="button"
                onClick={() => setShowOffers((open) => !open)}
                aria-expanded={showOffers}
                className="flex w-full items-center justify-between text-sm font-medium"
              >
                <span>View all offers</span>
                <span className="flex items-center gap-2">
                  <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-semibold text-background">
                    {availableOffers.length}
                  </span>
                  <ChevronDownIcon
                    className={cn("size-4 transition-transform", showOffers && "rotate-180")}
                  />
                </span>
              </button>
              {showOffers ? (
                <ul className="mt-2 flex flex-col divide-y divide-border">
                  {availableOffers.map((offer) => (
                    <li key={offer.code}>
                      <OfferRow
                        offer={offer}
                        subtotal={subtotal}
                        currencyCode={currencyCode}
                        pendingCode={pendingCode}
                        disabled={busy}
                        onApply={apply}
                        className="py-3"
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function OfferRow({
  offer,
  subtotal,
  currencyCode,
  pendingCode,
  disabled,
  onApply,
  className,
}: {
  offer: CouponOffer;
  subtotal: number;
  currencyCode: string;
  pendingCode: string | null;
  disabled: boolean;
  onApply: (code: string) => void;
  className?: string;
}) {
  const shortfall = Math.max(0, offer.minimumAmount - subtotal);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        <TagIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold uppercase tracking-wide">{offer.code}</p>
        <p className="line-clamp-2 text-xs text-emerald-700 dark:text-emerald-400">
          {offer.title}
        </p>
        {shortfall > 0 ? (
          <p className="text-xs text-muted-foreground">
            Add {formatMoneyAmount(shortfall, currencyCode)} more to use this
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        size="sm"
        onClick={() => onApply(offer.code)}
        disabled={disabled || shortfall > 0}
        className="shrink-0 px-4"
      >
        {pendingCode === offer.code ? <LoaderCircleIcon className="animate-spin" /> : "Apply"}
      </Button>
    </div>
  );
}
