"use client";

import { KeyboardEvent, useState } from "react";
import { MapPinIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DELIVERY_PIN_INPUT_ID } from "@/components/shipping-summary";
import { Input } from "@/components/ui/input";
import { isValidPin, setDeliveryPin, useDeliveryPin } from "@/lib/delivery-pin";
import { cn } from "@/lib/utils";

/** Lets the customer enter their PIN code in the bag to see their delivery charge. */
export function DeliveryPinField({ className }: { className?: string }) {
  const pin = useDeliveryPin();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function save() {
    const trimmed = value.trim();
    if (!isValidPin(trimmed)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }
    setDeliveryPin(trimmed);
    setEditing(false);
    setError("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
    }
  }

  if (pin && !editing) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm",
          className,
        )}
      >
        <span className="flex items-center gap-2">
          <MapPinIcon className="size-4 shrink-0" />
          Delivering to <span className="font-semibold">{pin}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setValue(pin);
            setEditing(true);
          }}
          className="text-xs font-semibold underline underline-offset-4"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-background px-4 py-3", className)}>
      <p className="flex items-center gap-2 text-sm font-medium">
        <MapPinIcon className="size-4 shrink-0" />
        Check delivery charge for your PIN code
      </p>
      <div className="mt-3 flex gap-2">
        <Input
          id={DELIVERY_PIN_INPUT_ID}
          value={value}
          onChange={(event) => {
            setValue(event.target.value.replace(/\D/g, ""));
            setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="PIN code"
          aria-label="Delivery PIN code"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          className="h-10 rounded-sm focus-visible:ring-1!"
        />
        <Button type="button" onClick={save} className="h-10 px-5">
          Check
        </Button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
