"use client";

import { useSyncExternalStore } from "react";

/**
 * The delivery PIN code the customer last entered (in the bag or at
 * checkout), kept across page loads so the bag can show the right shipping
 * charge for their area before checkout.
 */
const STORAGE_KEY = "sharif-store:delivery-pin:v1";
const PIN_PATTERN = /^[1-9]\d{5}$/;

let pin = "";
let hasHydrated = false;
const listeners = new Set<() => void>();

export const isValidPin = (value: string) => PIN_PATTERN.test(value);

function subscribe(listener: () => void) {
  if (!hasHydrated && typeof window !== "undefined") {
    hasHydrated = true;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) ?? "";
      pin = isValidPin(stored) ? stored : "";
    } catch {
      // Storage may be unavailable; the PIN is just not remembered.
    }
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Saves a valid PIN code, or clears it with "". */
export function setDeliveryPin(value: string) {
  const next = isValidPin(value) ? value : "";
  if (next === pin) return;
  pin = next;
  try {
    if (pin) window.localStorage.setItem(STORAGE_KEY, pin);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable; the PIN still applies on this page.
  }
  for (const listener of listeners) listener();
}

export function useDeliveryPin() {
  return useSyncExternalStore(
    subscribe,
    () => pin,
    () => "",
  );
}
