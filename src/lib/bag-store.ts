import {
  addItemToBag,
  removeItemFromBag,
  setItemQuantity,
  toBagItem,
  type BagItem,
} from "@/lib/bag";
import { readBagFromStorage, writeBagToStorage } from "@/lib/bag-storage";
import type { WooProduct } from "@/lib/woocommerce";

/**
 * Module-level store backing `useBag()`, read via `useSyncExternalStore` so
 * localStorage hydration happens post-mount without calling setState inside
 * an effect (see react-hooks/set-state-in-effect).
 */
const EMPTY_ITEMS: BagItem[] = [];

let items: BagItem[] = EMPTY_ITEMS;
let hasHydrated = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function setItems(next: BagItem[]) {
  items = next;
  writeBagToStorage(items);
  notify();
}

export function subscribeToBag(listener: () => void) {
  if (!hasHydrated && typeof window !== "undefined") {
    hasHydrated = true;
    items = readBagFromStorage();
    notify();
  }

  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBagSnapshot() {
  return items;
}

export function getServerBagSnapshot() {
  return EMPTY_ITEMS;
}

export function addBagItem(
  product: WooProduct,
  categorySlug: string,
  quantity = 1,
) {
  setItems(addItemToBag(items, toBagItem(product, categorySlug, quantity)));
}

export function removeBagItem(productId: number) {
  setItems(removeItemFromBag(items, productId));
}

export function setBagItemQuantity(productId: number, quantity: number) {
  setItems(setItemQuantity(items, productId, quantity));
}

export function clearBag() {
  setItems([]);
}
