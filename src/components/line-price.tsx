import { getLineRegularTotal, getPercentOff, type BagItem } from "@/lib/bag";
import { formatMoneyAmount } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

/** A bag line's price: struck-through MRP, the price charged, and "(10% OFF)". */
export function LinePrice({ item, className }: { item: BagItem; className?: string }) {
  const total = item.unitPrice * item.quantity;
  const regular = getLineRegularTotal(item);
  const percentOff = getPercentOff(regular, total);

  return (
    <div className={cn("flex flex-col items-end text-right leading-tight", className)}>
      <span className="flex flex-wrap items-baseline justify-end gap-x-1.5">
        {percentOff ? (
          <s className="text-xs text-muted-foreground">
            {formatMoneyAmount(regular, item.currencyCode)}
          </s>
        ) : null}
        <span className="text-sm font-bold">{formatMoneyAmount(total, item.currencyCode)}</span>
      </span>
      {percentOff ? (
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          ({percentOff}% OFF)
        </span>
      ) : null}
    </div>
  );
}
