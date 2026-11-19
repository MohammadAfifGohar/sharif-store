import { FREE_SHIPPING_MIN, getShippingFee } from "@/lib/checkout";
import { formatMoneyAmount } from "@/lib/woocommerce";

/** Shipping row plus, below the free-shipping threshold, how much more to add. */
export function ShippingSummary({
  subtotal,
  currencyCode,
  freeShipping = false,
  showHint = true,
}: {
  /** Items total after any coupon. */
  subtotal: number;
  currencyCode: string;
  freeShipping?: boolean;
  /** Off where a free-shipping progress bar already says how much to add. */
  showHint?: boolean;
}) {
  const shippingFee = getShippingFee(subtotal, freeShipping);

  return (
    <>
      <div className="flex items-center justify-between">
        <span>Shipping</span>
        <span>{shippingFee ? formatMoneyAmount(shippingFee, currencyCode) : "Free"}</span>
      </div>
      {shippingFee && showHint ? (
        <p className="text-xs text-muted-foreground">
          Add {formatMoneyAmount(FREE_SHIPPING_MIN - subtotal, currencyCode)} more for free
          shipping on orders of {formatMoneyAmount(FREE_SHIPPING_MIN, currencyCode)} or more.
        </p>
      ) : null}
    </>
  );
}
