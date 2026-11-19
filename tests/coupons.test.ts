import assert from "node:assert/strict";
import test from "node:test";

import { evaluateCoupon, getCouponOffers, rankOffers, type CouponLine, type WooCoupon } from "../src/lib/coupons";

const coupon = (overrides: Partial<WooCoupon> = {}): WooCoupon => ({
  id: 1,
  code: "SAVE10",
  status: "publish",
  amount: "10",
  discount_type: "percent",
  date_expires_gmt: null,
  usage_count: 0,
  usage_limit: null,
  usage_limit_per_user: null,
  product_ids: [],
  excluded_product_ids: [],
  product_categories: [],
  excluded_product_categories: [],
  exclude_sale_items: false,
  minimum_amount: "0.00",
  maximum_amount: "0.00",
  free_shipping: false,
  description: "",
  email_restrictions: [],
  used_by: [],
  ...overrides,
});

const line = (overrides: Partial<CouponLine> = {}): CouponLine => ({
  productId: 10,
  variationId: null,
  categoryIds: [5],
  onSale: false,
  unitPrice: 300,
  quantity: 2,
  ...overrides,
});

const discountOf = (result: ReturnType<typeof evaluateCoupon>) =>
  result.ok ? result.discount : result.message;

test("percent coupons discount the eligible items", () => {
  assert.equal(discountOf(evaluateCoupon(coupon(), [line()])), 60);
  const result = evaluateCoupon(coupon(), [line()]);
  assert.equal(result.ok && result.code, "save10");
});

test("fixed cart coupons are capped at the items total", () => {
  assert.equal(discountOf(evaluateCoupon(coupon({ discount_type: "fixed_cart", amount: "100" }), [line()])), 100);
  assert.equal(
    discountOf(evaluateCoupon(coupon({ discount_type: "fixed_cart", amount: "1000" }), [line()])),
    600,
  );
});

test("fixed product coupons apply per unit and never exceed the price", () => {
  assert.equal(
    discountOf(evaluateCoupon(coupon({ discount_type: "fixed_product", amount: "50" }), [line()])),
    100,
  );
  assert.equal(
    discountOf(
      evaluateCoupon(coupon({ discount_type: "fixed_product", amount: "500" }), [line()]),
    ),
    600,
  );
});

test("rejects unknown, expired, used-up and unsupported coupons", () => {
  assert.equal(evaluateCoupon(null, [line()]).ok, false);
  assert.equal(evaluateCoupon(coupon({ status: "draft" }), [line()]).ok, false);
  assert.equal(
    evaluateCoupon(coupon({ date_expires_gmt: "2026-01-01T00:00:00" }), [line()], {
      now: new Date("2026-11-20"),
    }).ok,
    false,
  );
  assert.equal(evaluateCoupon(coupon({ usage_limit: 5, usage_count: 5 }), [line()]).ok, false);
  assert.equal(evaluateCoupon(coupon({ discount_type: "buy_x_get_y" }), [line()]).ok, false);
});

test("enforces minimum and maximum order amounts", () => {
  const min = evaluateCoupon(coupon({ minimum_amount: "999.00" }), [line()]);
  assert.equal(discountOf(min), "This coupon needs an order of ₹999 or more.");
  assert.equal(evaluateCoupon(coupon({ maximum_amount: "500.00" }), [line()]).ok, false);
});

test("only discounts items the coupon is restricted to", () => {
  const lines = [line(), line({ productId: 11, categoryIds: [6], unitPrice: 100, quantity: 1 })];
  assert.equal(discountOf(evaluateCoupon(coupon({ product_categories: [6] }), lines)), 10);
  assert.equal(discountOf(evaluateCoupon(coupon({ excluded_product_ids: [10] }), lines)), 10);
  assert.equal(discountOf(evaluateCoupon(coupon({ product_ids: [99] }), lines)).toString().includes("doesn't apply"), true);
  assert.equal(
    discountOf(evaluateCoupon(coupon({ exclude_sale_items: true }), [line({ onSale: true })])),
    "This coupon doesn't apply to the items in your bag.",
  );
});

test("checks email restrictions and per-customer limits", () => {
  const restricted = coupon({ email_restrictions: ["*@company.com"] });
  // Previews from the bag have no email yet; checkout always checks with one.
  assert.equal(evaluateCoupon(restricted, [line()]).ok, true);
  assert.equal(evaluateCoupon(restricted, [line()], { email: "Asha@Company.com" }).ok, true);
  assert.equal(evaluateCoupon(restricted, [line()], { email: "asha@gmail.com" }).ok, false);

  const once = coupon({ usage_limit_per_user: 1, used_by: ["asha@gmail.com"] });
  assert.equal(evaluateCoupon(once, [line()], { email: "ASHA@gmail.com" }).ok, false);
  assert.equal(evaluateCoupon(once, [line()], { email: "ravi@gmail.com" }).ok, true);
});

test("free shipping coupons apply even with no amount", () => {
  const result = evaluateCoupon(coupon({ amount: "0", free_shipping: true }), [line()]);
  assert.deepEqual(result, { ok: true, code: "save10", discount: 0, freeShipping: true });
});

test("lists only published, usable coupons marked [show] as offers", () => {
  const offers = getCouponOffers([
    coupon({ code: "WELCOME", description: "[show] 10% off your first order" }),
    coupon({ code: "BIG", discount_type: "fixed_cart", amount: "150", minimum_amount: "999", description: "[SHOW]" }),
    coupon({ code: "SECRET", description: "staff only" }),
    coupon({ code: "OLD", description: "[show]", usage_limit: 1, usage_count: 1 }),
    coupon({ code: "VIP", description: "[show]", email_restrictions: ["a@b.com"] }),
  ]);
  assert.deepEqual(
    offers.map(({ code, title, minimumAmount }) => ({ code, title, minimumAmount })),
    [
      { code: "welcome", title: "10% off your first order", minimumAmount: 0 },
      { code: "big", title: "₹150 off on orders of ₹999 or more", minimumAmount: 999 },
    ],
  );
});

test("recommends the biggest saving the bag qualifies for", () => {
  const offer = (code: string, amount: number, minimumAmount: number) => ({
    code,
    title: code,
    minimumAmount,
    discountType: "percent",
    amount,
    freeShipping: false,
  });
  const offers = [offer("sharif5", 5, 500), offer("sharif10", 10, 1000)];

  assert.deepEqual(rankOffers(offers, 1200, 2).map((o) => o.code), ["sharif10", "sharif5"]);
  assert.deepEqual(rankOffers(offers, 700, 1).map((o) => o.code), ["sharif5", "sharif10"]);
  assert.deepEqual(rankOffers(offers, 300, 1).map((o) => o.code), ["sharif5", "sharif10"]);
});
