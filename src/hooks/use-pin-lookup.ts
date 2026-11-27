"use client";

import type { PinCodeInfo } from "@/lib/pincode";

export type PinLookup =
  | { status: "error" }
  | { status: "unknown"; pin: string }
  | { status: "found"; info: PinCodeInfo };

const cache = new Map<string, Promise<PinLookup>>();

/**
 * City and state for a 6-digit PIN code (via /api/pincode). Each PIN code is
 * asked once per page load; failed lookups may be retried.
 */
export function lookupPin(pin: string): Promise<PinLookup> {
  const cached = cache.get(pin);
  if (cached) return cached;

  const request = fetch(`/api/pincode?pin=${encodeURIComponent(pin)}`)
    .then(async (response): Promise<PinLookup> => {
      if (response.ok) return { status: "found", info: (await response.json()) as PinCodeInfo };
      if (response.status === 404) return { status: "unknown", pin };
      return { status: "error" };
    })
    .catch((): PinLookup => ({ status: "error" }))
    .then((lookup) => {
      if (lookup.status === "error") cache.delete(pin);
      return lookup;
    });
  cache.set(pin, request);
  return request;
}
