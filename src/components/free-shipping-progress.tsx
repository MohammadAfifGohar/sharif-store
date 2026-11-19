import { TruckIcon } from "lucide-react";

import { getFreeShippingThreshold, type ShippingRules } from "@/lib/shipping";
import { formatMoneyAmount } from "@/lib/woocommerce";

/**
 * "Add ₹X more for free shipping" with a progress bar towards the amount set
 * on WooCommerce's Free shipping method. Hidden when free shipping doesn't
 * depend on the order amount.
 */
export function FreeShippingProgress({
  shipping,
  subtotal,
  itemsTotal,
  shippingFee,
  currencyCode,
}: {
  shipping: ShippingRules;
  /** Items total before any coupon. */
  subtotal: number;
  /** Items total after the coupon. */
  itemsTotal: number;
  shippingFee: number;
  currencyCode: string;
}) {
  const threshold = getFreeShippingThreshold(shipping);
  if (threshold === null || !shipping.flatRate) return null;

  const counted = shipping.freeShipping?.ignoreDiscounts ? subtotal : itemsTotal;
  const unlocked = shippingFee === 0;
  const remaining = Math.max(0, threshold - counted);
  const progress = unlocked || !threshold ? 100 : Math.min(100, (counted / threshold) * 100);

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-sm">
        <TruckIcon className="size-4 shrink-0 text-[#e80071]" />
        {unlocked ? (
          <span className="font-semibold">You&apos;ve unlocked FREE shipping!</span>
        ) : (
          <span>
            Add <strong>{formatMoneyAmount(remaining, currencyCode)}</strong> more for{" "}
            <strong>FREE shipping</strong>
          </span>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Progress towards free shipping"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-[#e80071] transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
