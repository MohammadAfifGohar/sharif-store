import { NextResponse } from "next/server";

import { getShippingRules } from "@/lib/shipping-settings";

/** Shipping rules from WooCommerce for an address (state and PIN code are optional). */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const state = params.get("state")?.trim().toUpperCase() ?? "";
  const postcode = params.get("postcode")?.trim() ?? "";

  const rules = await getShippingRules({
    state: /^[A-Z]{2,3}$/.test(state) ? state : undefined,
    postcode: /^[1-9]\d{5}$/.test(postcode) ? postcode : undefined,
  });

  return NextResponse.json(rules, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
