import assert from "node:assert/strict";
import test from "node:test";

import {
  getOpenProblemReportDeadline,
  getProblemReportDeadline,
  getProblemReportWhatsAppUrl,
} from "../src/lib/order-problem-report";

const deliveredOrder = {
  number: "1042",
  status: "completed",
  date_completed_gmt: "2026-11-10T06:30:00",
  line_items: [
    { name: "Rose Oud Attar", quantity: 2 },
    { name: "Musk Al Layl", quantity: 1 },
  ],
};

test("the report window runs 48 hours from delivery, read as UTC", () => {
  const deadline = getProblemReportDeadline(deliveredOrder);
  assert.equal(deadline?.toISOString(), "2026-11-12T06:30:00.000Z");
});

test("the report option shows only while the window is open", () => {
  assert.ok(
    getOpenProblemReportDeadline(deliveredOrder, new Date("2026-11-12T06:29:00Z")),
  );
  assert.equal(
    getOpenProblemReportDeadline(deliveredOrder, new Date("2026-11-12T06:30:00Z")),
    null,
  );
});

test("orders that are not delivered cannot be reported yet", () => {
  for (const status of ["processing", "on-hold", "pending", "cancelled"]) {
    assert.equal(getProblemReportDeadline({ ...deliveredOrder, status }), null);
  }
  assert.equal(
    getProblemReportDeadline({ ...deliveredOrder, date_completed_gmt: null }),
    null,
  );
});

test("the WhatsApp message carries the order number and items", () => {
  const url = getProblemReportWhatsAppUrl(deliveredOrder);
  const message = decodeURIComponent(url.split("?text=")[1]);

  assert.match(message, /order #1042/);
  assert.match(message, /- Rose Oud Attar × 2/);
  assert.match(message, /- Musk Al Layl × 1/);
  assert.match(message, /photos and the unboxing video/);
});
