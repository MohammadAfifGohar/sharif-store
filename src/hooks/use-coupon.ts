"use client";

import { useEffect, useSyncExternalStore } from "react";

import type { BagItem } from "@/lib/bag";
import {
  getCouponSnapshot,
  getItemsKey,
  getServerCouponSnapshot,
  refreshCoupon,
  subscribeToCoupon,
} from "@/lib/coupon-store";

/**
 * The coupon applied to this bag. When the bag changes the coupon is checked
 * again; until that finishes it is not counted, so totals never use a
 * discount priced for a different bag.
 */
export function useCoupon(items: BagItem[]) {
  const state = useSyncExternalStore(
    subscribeToCoupon,
    getCouponSnapshot,
    getServerCouponSnapshot,
  );
  const itemsKey = getItemsKey(items);

  useEffect(() => {
    void refreshCoupon(items);
    // `itemsKey` captures every change to `items` that matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, state.coupon?.code, state.pendingCode]);

  const coupon = state.coupon?.itemsKey === itemsKey ? state.coupon : null;
  return { ...state, coupon };
}
