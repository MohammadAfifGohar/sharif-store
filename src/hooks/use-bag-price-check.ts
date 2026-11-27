"use client";

import { useEffect, useState } from "react";

import { loadFreshBagLines } from "@/app/actions/bag-prices";
import type { BagChange } from "@/lib/bag";
import { refreshBagPrices } from "@/lib/bag-store";

/**
 * While `active`, checks the bag against the store's current prices and stock
 * and returns what had to change (nothing, usually).
 */
export function useBagPriceCheck(active: boolean) {
  const [changes, setChanges] = useState<BagChange[]>([]);

  useEffect(() => {
    if (!active) return;
    let live = true;
    void refreshBagPrices(loadFreshBagLines).then((found) => {
      if (live && found.length) setChanges(found);
    });
    return () => {
      live = false;
    };
  }, [active]);

  return changes;
}
