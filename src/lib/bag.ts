import { getRawPrice, type WooProduct } from "@/lib/woocommerce";

export type BagItem = {
  productId: number;
  variationId: number | null;
  variationLabel: string | null;
  slug: string;
  categorySlug: string;
  name: string;
  image: { src: string; alt: string } | null;
  unitPrice: number;
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
