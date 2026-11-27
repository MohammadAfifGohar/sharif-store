"use client";

import { useSyncExternalStore } from "react";

import { toBagItem, type BagItem, type BagVariation } from "@/lib/bag";
import { parseBagItems } from "@/lib/bag-storage";
import type { WooProduct } from "@/lib/woocommerce";

/**
 * The one product a shopper is buying with "Buy Now". It is kept apart from
 * the bag, so checkout shows only this product and the bag stays as it was.
 * Session storage keeps it for this tab only, and across a reload.
 */
const STORAGE_KEY = "sharif-store:buy-now:v1";

let item: BagItem | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function write(next: BagItem | null) {
  item = next;
  try {
    if (next) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([next]));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked; the item still works until the tab closes.
  }
  notify();
}

function subscribe(listener: () => void) {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    try {
      item = parseBagItems(window.sessionStorage.getItem(STORAGE_KEY))[0] ?? null;
    } catch {
      item = null;
    }
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function startBuyNow(
  product: WooProduct,
  categorySlug: string,
  variation?: BagVariation,
) {
  hydrated = true;
  write(toBagItem(product, categorySlug, 1, variation));
}

export function clearBuyNow() {
  write(null);
}

/** undefined until session storage has been read; then the item or null. */
export function useBuyNowItem(): BagItem | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => (hydrated ? item : undefined),
    () => undefined,
  );
}
