import type { BagItem } from "@/lib/bag";
import type { AppliedCoupon } from "@/lib/checkout";
import type { CouponOffer } from "@/lib/coupons";

/**
 * Module-level store for the coupon the customer applied, shared by the bag
 * and checkout and kept across page loads. Read via `useSyncExternalStore`
 * (see `useCoupon`), like the bag itself.
 */
export type CouponState = {
  /** The applied coupon, priced for the bag described by `itemsKey`. */
  coupon: (AppliedCoupon & { itemsKey: string }) | null;
  /** A code being checked, or null. */
  pendingCode: string | null;
  error: string;
  offers: CouponOffer[] | null;
};

const STORAGE_KEY = "sharif-store:coupon:v1";
const EMPTY_STATE: CouponState = { coupon: null, pendingCode: null, error: "", offers: null };

let state = EMPTY_STATE;
let hasHydrated = false;
let offersRequested = false;
const listeners = new Set<() => void>();

function setState(patch: Partial<CouponState>) {
  state = { ...state, ...patch };
  if ("coupon" in patch) {
    try {
      if (state.coupon) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.coupon));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage may be unavailable; the coupon still works for this page.
    }
  }
  for (const listener of listeners) listener();
}

function readStoredCoupon(): CouponState["coupon"] {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    return value && typeof value.code === "string" && typeof value.itemsKey === "string"
      ? value
      : null;
  } catch {
    return null;
  }
}

export function subscribeToCoupon(listener: () => void) {
  if (!hasHydrated && typeof window !== "undefined") {
    hasHydrated = true;
    state = { ...state, coupon: readStoredCoupon() };
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getCouponSnapshot = () => state;
export const getServerCouponSnapshot = () => EMPTY_STATE;

/** Identifies the bag a coupon was priced for. */
export function getItemsKey(items: BagItem[]) {
  return JSON.stringify(
    items.map((item) => [item.productId, item.variationId, item.quantity]),
  );
}

function toOrderItems(items: BagItem[]) {
  return items.map((item) => ({
    productId: item.productId,
    variationId: item.variationId,
    quantity: item.quantity,
  }));
}

async function requestCoupon(code: string, items: BagItem[], email?: string) {
  const response = await fetch("/api/coupon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, items: toOrderItems(items), ...(email ? { email } : {}) }),
  });
  const data = (await response.json().catch(() => ({}))) as AppliedCoupon & { message?: string };
  if (!response.ok) throw new Error(data.message || "This coupon could not be applied.");
  return data;
}

export async function applyCoupon(code: string, items: BagItem[], email?: string) {
  const trimmed = code.trim();
  if (!trimmed) {
    setState({ error: "Enter a coupon code." });
    return false;
  }
  if (state.pendingCode) return false;

  setState({ pendingCode: trimmed.toLowerCase(), error: "" });
  try {
    const applied = await requestCoupon(trimmed, items, email);
    setState({ coupon: { ...applied, itemsKey: getItemsKey(items) }, pendingCode: null });
    return true;
  } catch (error) {
    setState({
      pendingCode: null,
      error: error instanceof Error ? error.message : "This coupon could not be applied.",
    });
    return false;
  }
}

/** Re-prices the applied coupon after the bag changes, dropping it if it no longer applies. */
export async function refreshCoupon(items: BagItem[]) {
  const current = state.coupon;
  if (!current || state.pendingCode || current.itemsKey === getItemsKey(items)) return;
  if (!items.length) {
    setState({ coupon: null, error: "" });
    return;
  }

  setState({ pendingCode: current.code });
  try {
    const applied = await requestCoupon(current.code, items);
    setState({ coupon: { ...applied, itemsKey: getItemsKey(items) }, pendingCode: null });
  } catch (error) {
    setState({
      coupon: null,
      pendingCode: null,
      error: `${current.code.toUpperCase()} was removed: ${
        error instanceof Error ? error.message : "it no longer applies."
      }`,
    });
  }
}

export function removeCoupon() {
  setState({ coupon: null, error: "" });
}

export function clearCouponError() {
  if (state.error) setState({ error: "" });
}

/** Loads the advertised offers once per page load. */
export async function loadCouponOffers() {
  if (offersRequested) return;
  offersRequested = true;
  try {
    const response = await fetch("/api/coupon");
    const data = (await response.json()) as { offers?: CouponOffer[] };
    setState({ offers: data.offers ?? [] });
  } catch {
    setState({ offers: [] });
  }
}
