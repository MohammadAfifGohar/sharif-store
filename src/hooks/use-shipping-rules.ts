"use client";

import { useEffect, useSyncExternalStore } from "react";

import { FALLBACK_SHIPPING_RULES, type ShippingRules } from "@/lib/shipping";

/**
 * Shipping rules from WooCommerce, fetched once per address per page load and
 * shared by every component. Until they arrive the built-in rules are used.
 */
let rulesByAddress: Record<string, ShippingRules> = {};
const requested = new Set<string>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => rulesByAddress;
const EMPTY: Record<string, ShippingRules> = {};
const getServerSnapshot = () => EMPTY;

async function load(key: string, state?: string, postcode?: string) {
  if (requested.has(key)) return;
  requested.add(key);
  try {
    const params = new URLSearchParams();
    if (state) params.set("state", state);
    if (postcode) params.set("postcode", postcode);
    const response = await fetch(`/api/shipping?${params.toString()}`);
    if (!response.ok) throw new Error(`Shipping rules failed with ${response.status}`);
    const rules = (await response.json()) as ShippingRules;
    rulesByAddress = { ...rulesByAddress, [key]: rules };
    for (const listener of listeners) listener();
  } catch {
    // Allow a retry on the next render; the built-in rules apply meanwhile.
    requested.delete(key);
  }
}

export function useShippingRules({
  state,
  postcode,
}: { state?: string; postcode?: string } = {}): ShippingRules {
  const validPostcode = postcode && /^[1-9]\d{5}$/.test(postcode) ? postcode : undefined;
  const key = `${state ?? ""}|${validPostcode ?? ""}`;
  const all = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    void load(key, state, validPostcode);
  }, [key, state, validPostcode]);

  // While a PIN-code-specific answer loads, use the general one if we have it.
  return all[key] ?? all[`${state ?? ""}|`] ?? all["|"] ?? FALLBACK_SHIPPING_RULES;
}
