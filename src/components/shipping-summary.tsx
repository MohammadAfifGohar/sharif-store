import { formatMoneyAmount } from "@/lib/woocommerce";

/** The shipping row of an order summary: the charge, or "Free". */
export function ShippingSummary({ fee, currencyCode }: { fee: number; currencyCode: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>Shipping</span>
      <span>{fee ? formatMoneyAmount(fee, currencyCode) : "Free"}</span>
    </div>
  );
}
