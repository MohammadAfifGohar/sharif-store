import { InfoIcon } from "lucide-react";

import type { BagChange } from "@/lib/bag";
import { formatMoneyAmount } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

function describe(change: BagChange, currencyCode: string) {
  switch (change.kind) {
    case "price":
      return `${change.name}: price is now ${formatMoneyAmount(change.to, currencyCode)} (was ${formatMoneyAmount(change.from, currencyCode)})`;
    case "quantity":
      return `${change.name}: only ${change.to} left, so the quantity was reduced`;
    case "removed":
      return `${change.name}: no longer available, so it was removed`;
  }
}

/** Tells the shopper what changed in their bag since they added things to it. */
export function BagChangeNotice({
  changes,
  currencyCode = "INR",
  className,
}: {
  changes: BagChange[];
  currencyCode?: string;
  className?: string;
}) {
  if (changes.length === 0) return null;

  return (
    <div
      role="status"
      className={cn(
        "flex gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950",
        className,
      )}
    >
      <InfoIcon className="mt-0.5 size-4 shrink-0 text-amber-700" />
      <div>
        <p className="font-semibold">Your bag was updated to today&apos;s prices and stock</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-amber-900">
          {changes.map((change) => (
            <li key={`${change.kind}-${change.name}`}>{describe(change, currencyCode)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
