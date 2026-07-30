import assert from "node:assert/strict";
import test from "node:test";

import { getWhatsAppBagOrderUrl } from "../src/lib/whatsapp-order";

test("builds a wa.me url encoding every bag item and the subtotal", () => {
  const url = getWhatsAppBagOrderUrl(
    [
      {
        name: "Rose Oud Attar",
        quantity: 2,
        unitPriceDisplay: "₹499",
        productUrl: "https://thesharifstore.in/category/fragrance/rose-oud-attar",
      },
      {
        name: "Musk Al Layl",
        quantity: 1,
        unitPriceDisplay: "₹299",
        productUrl: "https://thesharifstore.in/category/fragrance/musk-al-layl",
      },
    ],
    "₹1,297",
  );

  assert.match(url, /^https:\/\/wa\.me\/917020878764\?text=/);

  const message = decodeURIComponent(url.split("?text=")[1]);

  assert.match(message, /1\. \*Rose Oud Attar\*/);
  assert.match(message, /Qty: 2 x ₹499/);
  assert.match(message, /rose-oud-attar/);
  assert.match(message, /2\. \*Musk Al Layl\*/);
  assert.match(message, /Qty: 1 x ₹299/);
  assert.match(message, /musk-al-layl/);
  assert.match(message, /\*Total:\* ₹1,297/);
});
