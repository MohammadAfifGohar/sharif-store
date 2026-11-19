import { TruckIcon } from "lucide-react";

import { FREE_SHIPPING_MIN } from "@/lib/checkout";
import { formatMoneyAmount } from "@/lib/woocommerce";

/** "Add ₹X more for free shipping" with a progress bar towards the threshold. */
export function FreeShippingProgress({
  itemsTotal,
  currencyCode,
  freeShipping = false,
}: {
  /** Items total after any coupon. */
  itemsTotal: number;
  currencyCode: string;
  freeShipping?: boolean;
}) {
  const remaining = Math.max(0, FREE_SHIPPING_MIN - itemsTotal);
  const unlocked = freeShipping || remaining === 0;
  const progress = unlocked ? 100 : Math.min(100, (itemsTotal / FREE_SHIPPING_MIN) * 100);

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
