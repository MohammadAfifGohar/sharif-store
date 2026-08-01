import { MinusIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
  size?: "sm" | "lg";
  className?: string;
};

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  disabled,
  size = "lg",
  className,
}: QuantityStepperProps) {
  const buttonSize = size === "sm" ? "icon-xs" : "icon-lg";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-background",
        size === "sm"
          ? "gap-1 p-0.5"
          : "h-11 w-full justify-between rounded-xl bg-muted/35 p-0.5",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        disabled={disabled}
        onClick={onDecrement}
        aria-label="Decrease quantity"
      >
        <MinusIcon />
      </Button>
      <span
        className={cn(
          "text-center font-semibold tabular-nums",
          size === "sm" ? "min-w-[1.5em] text-xs" : "min-w-10 text-base",
        )}
      >
        {quantity}
      </span>
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        disabled={disabled}
        onClick={onIncrement}
        aria-label="Increase quantity"
      >
        <PlusIcon />
      </Button>
    </div>
  );
}
