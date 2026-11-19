import "server-only";

import {
  FALLBACK_SHIPPING_RULES,
  pickShippingRules,
  rulesFromMethods,
  type ShippingRules,
  type ShippingZone,
  type ZoneLocation,
} from "@/lib/shipping";
import { orderRequest } from "@/lib/woocommerce-orders";

const TTL_MS = 5 * 60_000;
let cache: { at: number; zones: ShippingZone[] } | null = null;

async function loadZones(): Promise<ShippingZone[]> {
  const zones = await orderRequest<Array<{ id: number; order: number }>>("shipping/zones");
  return Promise.all(
    zones.map(async (zone) => {
      const [locations, methods] = await Promise.all([
        zone.id === 0
          ? Promise.resolve([] as ZoneLocation[])
          : orderRequest<ZoneLocation[]>(`shipping/zones/${zone.id}/locations`),
        orderRequest<Parameters<typeof rulesFromMethods>[1]>(
          `shipping/zones/${zone.id}/methods`,
        ),
      ]);
      return { id: zone.id, order: zone.order, locations, rules: rulesFromMethods(zone.id, methods) };
    }),
  );
}

/**
 * Shipping rules for an address from WooCommerce's shipping zones, cached for
 * a few minutes. Falls back to the built-in rules if WooCommerce is down, so
 * checkout keeps working.
 */
export async function getShippingRules(
  address: { state?: string; postcode?: string } = {},
): Promise<ShippingRules> {
  try {
    if (!cache || Date.now() - cache.at > TTL_MS) {
      cache = { at: Date.now(), zones: await loadZones() };
    }
    return pickShippingRules(cache.zones, address);
  } catch (cause) {
    console.error("[shipping] could not load WooCommerce shipping zones", cause);
    return FALLBACK_SHIPPING_RULES;
  }
}
