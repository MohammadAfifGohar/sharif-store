import { textFromHtml } from "@/lib/html-text";

/**
 * A WooCommerce product description split into pieces the product page can
 * lay out: the opening paragraphs, then labelled facts ("Key ingredients:",
 * "How to use:" …), small headings and bullet lists.
 */
export type DescriptionBlock =
  | { kind: "text"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "ingredients"; label: string; items: string[] }
  | { kind: "steps"; label: string; items: string[] }
  | { kind: "fact"; label: string; text: string };

export type ProductDescription = {
  /** Plain paragraphs before the first labelled fact or heading. */
  intro: string[];
  blocks: DescriptionBlock[];
};

const BULLET = /^\s*(?:[-–—•*·]|&#8211;|&#8212;|&#8226;)\s*/;
const INGREDIENTS = /ingredient/i;
const STEPS = /how to use|directions|usage|how to apply/i;

/** Split at commas that are not inside brackets, e.g. "Vitamin C (3%), Zinc". */
function splitList(text: string) {
  const items: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of text) {
    if (char === "(" || char === "[") depth += 1;
    if ((char === ")" || char === "]") && depth > 0) depth -= 1;
    if (char === "," && depth === 0) {
      items.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  items.push(current);
  return items.map((item) => item.trim().replace(/\.$/, "")).filter(Boolean);
}

/** "Cleanse. Apply 2-3 drops. Follow with…" → one step per sentence. */
function splitSentences(text: string) {
  return text
    .split(/(?<=[.!])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function labelled(label: string, value: string): DescriptionBlock {
  const cleanLabel = label.replace(/[:\s]+$/, "").trim();
  const text = value.replace(/^[:\s]+/, "").trim();

  if (INGREDIENTS.test(cleanLabel)) {
    return { kind: "ingredients", label: cleanLabel, items: splitList(text) };
  }
  if (STEPS.test(cleanLabel)) {
    return { kind: "steps", label: cleanLabel, items: splitSentences(text) };
  }
  return { kind: "fact", label: cleanLabel, text };
}

/** One paragraph of HTML → a block, or null when it has no text. */
function toBlock(html: string): DescriptionBlock | null {
  const lines = html
    .split(/<br\s*\/?>/i)
    .map((line) => line.trim())
    .filter((line) => textFromHtml(line));

  if (lines.length === 0) return null;

  // Lines that each start with a dash or bullet become a list.
  if (lines.length > 1 && lines.every((line) => BULLET.test(line))) {
    return {
      kind: "list",
      items: lines.map((line) => textFromHtml(line.replace(BULLET, ""))),
    };
  }

  const strong = html.match(/^\s*<(strong|b)>([\s\S]*?)<\/\1>([\s\S]*)$/i);
  if (strong) {
    const label = textFromHtml(strong[2]);
    const rest = textFromHtml(strong[3]);
    if (!rest) return { kind: "heading", text: label.replace(/:$/, "") };
    if (label.endsWith(":") || rest.startsWith(":")) return labelled(label, rest);
  }

  const text = textFromHtml(html);

  // "Main Highlights:" on its own line is a heading.
  if (text.endsWith(":") && text.length <= 40) {
    return { kind: "heading", text: text.slice(0, -1).trim() };
  }

  // A short "Label: value" line such as "Quantity: 100ml".
  const fact = text.match(/^([A-Za-z][A-Za-z &/]{1,24}):\s+(.+)$/);
  if (fact && fact[1].trim().split(/\s+/).length <= 3) {
    return labelled(fact[1], fact[2]);
  }

  return { kind: "text", text };
}

export function parseProductDescription(
  html: string | undefined,
  productName = "",
): ProductDescription {
  const name = textFromHtml(productName).toLowerCase();
  const source = (html ?? "")
    // List items become dashed lines so they read like hand-typed lists.
    .replace(/<li[^>]*>/gi, "– ")
    .replace(/<\/li>/gi, "<br>")
    .replace(/<\/?(?:ul|ol)[^>]*>/gi, "</p><p>");

  const blocks = source
    .split(/<\/?(?:p|div|h[1-6])(?:\s[^>]*)?>/i)
    .map(toBlock)
    .filter((block): block is DescriptionBlock => block !== null)
    // Some descriptions start by repeating the product name.
    .filter((block) => !(block.kind === "text" && block.text.toLowerCase() === name))
    .filter((block) => block.kind !== "fact" || block.text)
    // A trailing list item can end in <br>; drop lists that ended up empty.
    .filter((block) => !("items" in block) || block.items.length > 0);

  const firstStructured = blocks.findIndex((block) => block.kind !== "text");
  const introEnd = firstStructured === -1 ? blocks.length : firstStructured;

  const intro = blocks
    .slice(0, introEnd)
    .map((block) => (block.kind === "text" ? block.text : ""))
    .filter(Boolean);

  // A short first line without a full stop, above the real overview, is the
  // product title typed again (often worded a little differently).
  if (intro.length > 1 && intro[0].length <= 100 && !/[.!?]$/.test(intro[0])) {
    intro.shift();
  }

  return { intro, blocks: blocks.slice(introEnd) };
}
