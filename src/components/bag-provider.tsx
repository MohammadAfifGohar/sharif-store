"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

import { getBagSubtotal, getBagTotalCount } from "@/lib/bag";
import {
  addBagItem,
  clearBag,
  getBagSnapshot,
  getServerBagSnapshot,
  removeBagItem,
  setBagItemQuantity,
  subscribeToBag,
} from "@/lib/bag-store";
import type { BagItem } from "@/lib/bag";
import type { WooProduct } from "@/lib/woocommerce";

type BagContextValue = {
  items: BagItem[];
  addItem: (product: WooProduct, categorySlug: string, quantity?: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  totalCount: number;
  subtotal: number;
};

const BagContext = createContext<BagContextValue | null>(null);

export function BagProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToBag,
    getBagSnapshot,
    getServerBagSnapshot,
  );

  const value: BagContextValue = {
    items,
    addItem: addBagItem,
    removeItem: removeBagItem,
    setQuantity: setBagItemQuantity,
    clear: clearBag,
    totalCount: getBagTotalCount(items),
    subtotal: getBagSubtotal(items),
  };

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const context = useContext(BagContext);

  if (!context) {
    throw new Error("useBag must be used within a BagProvider");
  }

  return context;
}
