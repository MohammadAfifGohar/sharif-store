import { getPercentOff } from "@/lib/bag";
import { formatMoneyAmount } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

/** "Total  ~~₹1,992~~ ₹1,792 (10% OFF)" — struck-through MRP when something is saved. */
export function OrderTotalRow({
  label,
  total,
  regularTotal,
  currencyCode,
}: {
  label: string;
  total: number;
  /** What the order would cost at MRP, with the same shipping. */
  regularTotal: number;
  currencyCode: string;
}) {
  const percentOff = getPercentOff(regularTotal, total);

  return (
    <div className="mt-1 flex items-start justify-between gap-3 border-t border-border/70 pt-3">
      <span className="text-base font-semibold">{label}</span>
      <span className="flex flex-col items-end leading-tight">
        <span className="flex items-baseline gap-2">
          {percentOff ? (
            <s className="text-sm text-muted-foreground">
              {formatMoneyAmount(regularTotal, currencyCode)}
            </s>
          ) : null}
          <span className="text-lg font-bold">{formatMoneyAmount(total, currencyCode)}</span>
        </span>
        {percentOff ? (
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            ({percentOff}% OFF)
          </span>
        ) : null}
      </span>
    </div>
  );
}

/** "₹200 saved so far" pill; renders nothing when nothing is saved. */
export function SavingsBanner({
  amount,
  currencyCode,
  className,
}: {
  amount: number;
  currencyCode: string;
  className?: string;
}) {
  if (Math.round(amount) <= 0) return null;

  return (
    <p
      className={cn(
        "rounded-full bg-emerald-600 px-4 py-1 text-center text-sm font-semibold text-white shadow-sm",
        className,
      )}
    >
      {formatMoneyAmount(amount, currencyCode)} saved so far
    </p>
  );
}
