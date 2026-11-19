import { NextResponse } from "next/server";

import { couponRequestSchema, type AppliedCoupon } from "@/lib/checkout";
import { checkCoupon, listCouponOffers } from "@/lib/coupon-check";
import type { CouponOffer } from "@/lib/coupons";
import {
  createRateLimiter,
  getClientIp,
  isAllowedOrigin,
  readJsonBody,
} from "@/lib/request-guards";
import { isWooOrdersConfigured } from "@/lib/woocommerce-orders";

const MAX_BODY_SIZE = 10_000;
// Tight enough to stop anyone guessing codes by brute force.
const isRateLimited = createRateLimiter(15, 60_000);

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

/** Coupons the store advertises in the bag (marked `[show]` in WooCommerce). */
export async function GET() {
  if (!isWooOrdersConfigured()) return NextResponse.json({ offers: [] });

  try {
    const offers: CouponOffer[] = await listCouponOffers();
    return NextResponse.json({ offers });
  } catch (cause) {
    console.error("[coupon] could not list offers", cause);
    return NextResponse.json({ offers: [] });
  }
}

/** Checks a coupon code against the bag and returns its discount. */
export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) return error("Request was not allowed.", 403);
  if (isRateLimited(getClientIp(request))) {
    return error("Too many attempts. Please wait a minute and try again.", 429);
  }
  if (!isWooOrdersConfigured()) return error("Coupons are not available right now.", 503);

  const parsedBody = await readJsonBody(request, MAX_BODY_SIZE);
  if (!parsedBody.ok) return error("The coupon could not be read.", parsedBody.status);

  const parsed = couponRequestSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Enter a valid coupon code.", 400);
  }

  try {
    const result = await checkCoupon(parsed.data.code, parsed.data.items, parsed.data.email);
    if (!result.ok) return error(result.message, 422);

    const body: AppliedCoupon = {
      code: result.code,
      discount: result.discount,
      freeShipping: result.freeShipping,
    };
    return NextResponse.json(body);
  } catch (cause) {
    console.error("[coupon] could not check coupon", cause);
    return error("We couldn't check this coupon. Please try again.", 502);
  }
}
