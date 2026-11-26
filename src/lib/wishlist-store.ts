"use client";

import { useSyncExternalStore } from "react";

import {
  WISHLIST_STORAGE_KEY,
  isInWishlist,
  parseWishlist,
  removeWishlistEntries,
  toggleWishlistEntry,
  type WishlistEntry,
} from "@/lib/wishlist";

/**
 * Module-level store read with `useSyncExternalStore`, like the bag: the
 * browser's saved list is loaded after mount, and other open tabs follow
 * along through the `storage` event.
 */
const EMPTY: WishlistEntry[] = [];

/** null until the saved list has been read from the browser. */
let entries: WishlistEntry[] | null = null;
let hasHydrated = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function read() {
  try {
    return parseWishlist(window.localStorage.getItem(WISHLIST_STORAGE_KEY));
  } catch {
    return EMPTY;
  }
}

function setEntries(next: WishlistEntry[]) {
  entries = next;
  try {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage can be blocked (private mode); the list still works until the tab closes.
  }
  notify();
}

function subscribe(listener: () => void) {
  if (!hasHydrated && typeof window !== "undefined") {
    hasHydrated = true;
    entries = read();
    window.addEventListener("storage", (event) => {
      if (event.key === WISHLIST_STORAGE_KEY) {
        entries = read();
        notify();
      }
    });
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function toggle(productId: number, categorySlug: string) {
  setEntries(toggleWishlistEntry(entries ?? read(), productId, categorySlug));
}

function remove(productIds: number[]) {
  setEntries(removeWishlistEntries(entries ?? read(), productIds));
}

export function useWishlist() {
  const snapshot = useSyncExternalStore(subscribe, () => entries, () => null);
  const current = snapshot ?? EMPTY;
  return {
    /** False on the server and until the browser's saved list is loaded. */
    ready: snapshot !== null,
    entries: current,
    count: current.length,
    has: (productId: number) => isInWishlist(current, productId),
    toggle,
    remove,
  };
}
