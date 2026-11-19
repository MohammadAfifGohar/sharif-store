import assert from "node:assert/strict";
import test from "node:test";

import {
  describeShipping,
  pickShippingRules,
  quoteShipping,
  rulesFromMethods,
  type ShippingZone,
} from "../src/lib/shipping";

// The methods exactly as the store's WooCommerce "india" zone returns them.
const indiaMethods = [
  {
    instance_id: 1,
    method_id: "free_shipping",
    title: "Free shipping",
    enabled: true,
    order: 1,
    settings: {
      title: { value: "Free shipping" },
      requires: { value: "min_amount" },
      min_amount: { value: "499" },
      ignore_discounts: { value: "no" },
    },
  },
  {
    instance_id: 2,
    method_id: "flat_rate",
    title: "Flat rate",
    enabled: true,
    order: 2,
    settings: { title: { value: "Flat rate" }, cost: { value: "59" } },
  },
];
const india = rulesFromMethods(1, indiaMethods);

test("reads Flat rate and Free shipping from a WooCommerce zone", () => {
  assert.deepEqual(india.flatRate, { instanceId: 2, title: "Flat rate", cost: 59 });
  assert.deepEqual(india.freeShipping, {
    instanceId: 1,
    title: "Free shipping",
    requires: "min_amount",
    minAmount: 499,
    ignoreDiscounts: false,
  });
  assert.equal(rulesFromMethods(1, [{ ...indiaMethods[1], enabled: false }]).flatRate, null);
});

test("charges the flat rate until the free shipping minimum, counted after coupons", () => {
  assert.equal(quoteShipping(india, { subtotal: 300, itemsTotal: 300 }).fee, 59);
  assert.equal(quoteShipping(india, { subtotal: 498.99, itemsTotal: 498.99 }).fee, 59);
  const free = quoteShipping(india, { subtotal: 499, itemsTotal: 499 });
  assert.deepEqual(free, {
    fee: 0,
    method: { id: "free_shipping", instanceId: 1, title: "Free shipping" },
  });
  // ₹550 of items with a ₹100 coupon is ₹450 — below ₹499.
  assert.equal(quoteShipping(india, { subtotal: 550, itemsTotal: 450 }).fee, 59);
  const beforeCoupons = { ...india, freeShipping: { ...india.freeShipping!, ignoreDiscounts: true } };
  assert.equal(quoteShipping(beforeCoupons, { subtotal: 550, itemsTotal: 450 }).fee, 0);
});

test("free-shipping coupons work only when the Free shipping method allows coupons", () => {
  const order = { subtotal: 200, itemsTotal: 200, freeShippingCoupon: true };
  assert.equal(quoteShipping(india, order).fee, 59);
  const either = { ...india, freeShipping: { ...india.freeShipping!, requires: "either" } };
  assert.equal(quoteShipping(either, order).fee, 0);
  const always = { ...india, freeShipping: { ...india.freeShipping!, requires: "" } };
  assert.equal(quoteShipping(always, { subtotal: 10, itemsTotal: 10 }).fee, 0);
});

test("picks the zone for the address, PIN code zones first in WooCommerce order", () => {
  const local = { ...india, zoneId: 2, flatRate: { instanceId: 9, title: "Local delivery", cost: 20 } };
  const zones: ShippingZone[] = [
    { id: 0, order: 0, locations: [], rules: { ...india, zoneId: 0, flatRate: null, freeShipping: null } },
    { id: 2, order: 0, locations: [{ code: "4317*", type: "postcode" }], rules: local },
    { id: 1, order: 1, locations: [{ code: "IN", type: "country" }], rules: india },
  ];
  assert.equal(pickShippingRules(zones, { postcode: "431717" }).zoneId, 2);
  assert.equal(pickShippingRules(zones, { postcode: "400001", state: "MH" }).zoneId, 1);
  // The bag has no PIN code yet, so it uses the country zone.
  assert.equal(pickShippingRules(zones).zoneId, 1);
  const ranged: ShippingZone = { ...zones[1], locations: [{ code: "431700...431799", type: "postcode" }] };
  assert.equal(pickShippingRules([ranged, zones[2]], { postcode: "431750" }).zoneId, 2);
});

test("describes the rules for the Terms page", () => {
  assert.equal(
    describeShipping(india),
    "For orders placed on this website, shipping is free when your items total ₹499 or more after any coupon discount. Smaller orders carry a shipping charge of ₹59, which is shown in the order total before you place the order.",
  );
});
