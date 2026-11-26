import { formatMoneyAmount } from "@/lib/woocommerce";

/** The bag's PIN code input, which the "Enter PIN code" label points to. */
export const DELIVERY_PIN_INPUT_ID = "delivery-pin";

/**
 * The shipping row of an order summary: the charge, or "Free". A null fee
 * means the charge depends on a PIN code not entered yet.
 */
export function ShippingSummary({ fee, currencyCode }: { fee: number | null; currencyCode: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>Shipping</span>
      {fee === null ? (
        <label
          htmlFor={DELIVERY_PIN_INPUT_ID}
          className="cursor-pointer text-xs font-medium underline underline-offset-4"
        >
          Enter PIN code
        </label>
      ) : (
        <span>{fee ? formatMoneyAmount(fee, currencyCode) : "Free"}</span>
      )}
    </div>
  );
}
