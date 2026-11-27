import {
  addItemToBag,
  applyFreshBagLines,
  removeItemFromBag,
  setItemQuantity,
  toBagItem,
  type BagChange,
  type BagItem,
  type BagVariation,
  type FreshBagLine,
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
  variation?: BagVariation,
) {
  setItems(addItemToBag(items, toBagItem(product, categorySlug, quantity, variation)));
}

export function removeBagItem(productId: number, variationId: number | null) {
  setItems(removeItemFromBag(items, productId, variationId));
}

export function setBagItemQuantity(
  productId: number,
  variationId: number | null,
  quantity: number,
) {
  setItems(setItemQuantity(items, productId, variationId, quantity));
}

export function clearBag() {
  setItems([]);
}

let lastPriceCheck = 0;
let pendingPriceCheck: Promise<BagChange[]> | null = null;

/**
 * Brings the saved bag up to date with the store's current prices and stock
 * (see applyFreshBagLines). Checks at most once every 30 seconds; returns
 * what changed so the shopper can be told.
 */
export function refreshBagPrices(
  load: (lines: Array<{ productId: number; variationId: number | null }>) => Promise<FreshBagLine[] | null>,
): Promise<BagChange[]> {
  if (pendingPriceCheck) return pendingPriceCheck;
  // Child components can ask before the provider has read the saved bag.
  if (!hasHydrated && typeof window !== "undefined") {
    hasHydrated = true;
    items = readBagFromStorage();
  }
  if (items.length === 0 || Date.now() - lastPriceCheck < 30_000) return Promise.resolve([]);

  const lines = items.map(({ productId, variationId }) => ({ productId, variationId }));
  pendingPriceCheck = load(lines)
    .then((fresh) => {
      if (!fresh) return [];
      lastPriceCheck = Date.now();
      const result = applyFreshBagLines(items, fresh);
      if (JSON.stringify(result.items) !== JSON.stringify(items)) setItems(result.items);
      return result.changes;
    })
    .catch(() => [])
    .finally(() => {
      pendingPriceCheck = null;
    });
  return pendingPriceCheck;
}
