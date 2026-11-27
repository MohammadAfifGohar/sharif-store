import assert from "node:assert/strict";
import test from "node:test";

import { parseProductDescription } from "../src/lib/product-description";

test("splits the usual skin-care layout into intro, ingredients, facts and steps", () => {
  const html = `<p>Dot &amp; Key serum fades acne scars. Dermatologically tested.</p>
<p><strong>Key ingredients:</strong> Cica, 10% Niacinamide, Vitamin C (3%, stable), Oatmeal</p>
<p><strong>Suitable for:</strong> Oily &amp; acne-prone skin</p>
<p><strong>How to use:</strong> Cleanse your face and pat dry. Apply 2-3 drops evenly. Use sunscreen in the day.</p>`;

  assert.deepEqual(parseProductDescription(html), {
    intro: ["Dot & Key serum fades acne scars. Dermatologically tested."],
    blocks: [
      {
        kind: "ingredients",
        label: "Key ingredients",
        items: ["Cica", "10% Niacinamide", "Vitamin C (3%, stable)", "Oatmeal"],
      },
      { kind: "fact", label: "Suitable for", text: "Oily & acne-prone skin" },
      {
        kind: "steps",
        label: "How to use",
        items: ["Cleanse your face and pat dry.", "Apply 2-3 drops evenly.", "Use sunscreen in the day."],
      },
    ],
  });
});

test("reads hand-typed dash lists, headings and a repeated product name", () => {
  const html = `<p>Mango Detan Gel Face Wash – 100ml</p>
<p>A refreshing gel face wash.</p>
<p>Main Highlights:</p>
<p>&#8211; Helps Fade Stubborn Tan<br />
&#8211; SLS &amp; SLES Free</p>
<p>Quantity: 100ml</p>`;

  assert.deepEqual(parseProductDescription(html, "Mango Detan Gel Face Wash &#8211; 100ml"), {
    intro: ["A refreshing gel face wash."],
    blocks: [
      { kind: "heading", text: "Main Highlights" },
      { kind: "list", items: ["Helps Fade Stubborn Tan", "SLS & SLES Free"] },
      { kind: "fact", label: "Quantity", text: "100ml" },
    ],
  });
});

test("drops a title line typed above the overview even when worded differently", () => {
  const html = "<p>Dot &amp; Key Mango Face Wash – 100ml</p><p>Fades tan.</p><p>Gentle on skin.</p>";
  assert.deepEqual(parseProductDescription(html, "Dot and Key Mango Detan Gel Face Wash").intro, [
    "Fades tan.",
    "Gentle on skin.",
  ]);
  // A single plain paragraph is always kept.
  assert.deepEqual(parseProductDescription("<p>Soft plush toy</p>").intro, ["Soft plush toy"]);
});

test("turns editor bullet lists into list blocks and copes with empty input", () => {
  assert.deepEqual(parseProductDescription("<ul><li>Soft</li><li>Safe</li></ul>").blocks, [
    { kind: "list", items: ["Soft", "Safe"] },
  ]);
  assert.deepEqual(parseProductDescription(""), { intro: [], blocks: [] });
  assert.deepEqual(parseProductDescription(undefined), { intro: [], blocks: [] });
});
