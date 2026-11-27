import { getRawPrice, getSavingsAmount, type WooProduct } from "@/lib/woocommerce";

export type BagItem = {
  productId: number;
  variationId: number | null;
  variationLabel: string | null;
  slug: string;
  categorySlug: string;
  name: string;
  image: { src: string; alt: string } | null;
  unitPrice: number;
  /** Price before any sale (MRP); null on bags saved before this was tracked. */
  regularUnitPrice: number | null;
  currencyCode: string;
  quantity: number;
  /** Upper bound on quantity: 1 for sold-individually products, stock count when known, otherwise uncapped. */
  maxQuantity: number | null;
  soldIndividually: boolean;
};

export type BagVariation = {
  id: number;
  label: string;
  /** The resolved variation, itself a full product-shaped object with its own price/stock. */
  priceSource: WooProduct;
};

function clampQuantity(quantity: number, maxQuantity: number | null) {
  const bounded = maxQuantity !== null ? Math.min(quantity, maxQuantity) : quantity;

  return Math.max(0, Math.floor(bounded));
}

function isSameLine(line: BagItem, productId: number, variationId: number | null) {
  return line.productId === productId && line.variationId === variationId;
}

export function toBagItem(
  product: WooProduct,
  categorySlug: string,
  quantity: number,
  variation?: BagVariation,
): BagItem {
  const priceSource = variation?.priceSource ?? product;
  const image = priceSource.images[0] ?? product.images[0];
  const maxQuantity = priceSource.sold_individually
    ? 1
    : (priceSource.low_stock_remaining ?? null);

  return {
    productId: product.id,
    variationId: variation?.id ?? null,
    variationLabel: variation?.label ?? null,
    slug: product.slug,
    categorySlug,
    name: product.name,
    image: image ? { src: image.src, alt: image.alt || product.name } : null,
    unitPrice: getRawPrice(priceSource),
    regularUnitPrice: getRawPrice(priceSource) + getSavingsAmount(priceSource),
    currencyCode: priceSource.prices.currency_code,
    quantity: clampQuantity(quantity, maxQuantity),
    maxQuantity,
    soldIndividually: Boolean(priceSource.sold_individually),
  };
}

export function addItemToBag(items: BagItem[], item: BagItem): BagItem[] {
  const existing = items.find((line) =>
    isSameLine(line, item.productId, item.variationId),
  );

  if (!existing) {
    return [...items, item];
  }

  return setItemQuantity(
    items,
    item.productId,
    item.variationId,
    existing.quantity + item.quantity,
  );
}

export function removeItemFromBag(
  items: BagItem[],
  productId: number,
  variationId: number | null,
): BagItem[] {
  return items.filter((line) => !isSameLine(line, productId, variationId));
}

export function setItemQuantity(
  items: BagItem[],
  productId: number,
  variationId: number | null,
  quantity: number,
): BagItem[] {
  return items.flatMap((line) => {
    if (!isSameLine(line, productId, variationId)) return [line];

    const nextQuantity = clampQuantity(quantity, line.maxQuantity);

    return nextQuantity > 0 ? [{ ...line, quantity: nextQuantity }] : [];
  });
}

export function getBagTotalCount(items: BagItem[]): number {
  return items.reduce((total, line) => total + line.quantity, 0);
}

export function getBagSubtotal(items: BagItem[]): number {
  return items.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
}

/** A line's total at the regular price (MRP), never below what is charged. */
export function getLineRegularTotal(line: BagItem): number {
  return Math.max(line.regularUnitPrice ?? line.unitPrice, line.unitPrice) * line.quantity;
}

export function getBagRegularTotal(items: BagItem[]): number {
  return items.reduce((total, line) => total + getLineRegularTotal(line), 0);
}

/** Whole-number percentage saved off `regular`; 0 when nothing is saved. */
export function getPercentOff(regular: number, current: number): number {
  return regular > current && regular > 0
    ? Math.round(((regular - current) / regular) * 100)
    : 0;
}

/** The store's current price and stock for one bag line. */
export type FreshBagLine = {
  productId: number;
  variationId: number | null;
  /** False when the product was removed, hidden or sold out. */
  available: boolean;
  unitPrice: number;
  regularUnitPrice: number;
  maxQuantity: number | null;
  soldIndividually: boolean;
};

export type BagChange =
  | { kind: "price"; name: string; from: number; to: number }
  | { kind: "quantity"; name: string; from: number; to: number }
  | { kind: "removed"; name: string };

/**
 * Brings saved bag lines up to date with the store: new prices and stock
 * limits, and lines that can no longer be bought are dropped. Lines the store
 * did not answer for are left as they are. Returns what changed so the
 * shopper can be told.
 */
export function applyFreshBagLines(
  items: BagItem[],
  fresh: FreshBagLine[],
): { items: BagItem[]; changes: BagChange[] } {
  const changes: BagChange[] = [];
  const next = items.flatMap((line) => {
    const update = fresh.find((entry) => isSameLine(line, entry.productId, entry.variationId));
    if (!update) return [line];

    const name = line.variationLabel ? `${line.name} (${line.variationLabel})` : line.name;
    if (!update.available) {
      changes.push({ kind: "removed", name });
      return [];
    }

    const maxQuantity = update.soldIndividually ? 1 : update.maxQuantity;
    const quantity = clampQuantity(line.quantity, maxQuantity);
    if (quantity === 0) {
      changes.push({ kind: "removed", name });
      return [];
    }
    if (update.unitPrice !== line.unitPrice) {
      changes.push({ kind: "price", name, from: line.unitPrice, to: update.unitPrice });
    }
    if (quantity !== line.quantity) {
      changes.push({ kind: "quantity", name, from: line.quantity, to: quantity });
    }

    return [
      {
        ...line,
        unitPrice: update.unitPrice,
        regularUnitPrice: update.regularUnitPrice,
        maxQuantity,
        soldIndividually: update.soldIndividually,
        quantity,
      },
    ];
  });

  return { items: next, changes };
}
