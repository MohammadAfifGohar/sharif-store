import { getRawPrice, type WooProduct } from "@/lib/woocommerce";

export type BagItem = {
  productId: number;
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

function clampQuantity(quantity: number, maxQuantity: number | null) {
  const bounded = maxQuantity !== null ? Math.min(quantity, maxQuantity) : quantity;

  return Math.max(0, Math.floor(bounded));
}

export function toBagItem(
  product: WooProduct,
  categorySlug: string,
  quantity: number,
): BagItem {
  const image = product.images[0];
  const maxQuantity = product.sold_individually
    ? 1
    : (product.low_stock_remaining ?? null);

  return {
    productId: product.id,
    slug: product.slug,
    categorySlug,
    name: product.name,
    image: image ? { src: image.src, alt: image.alt || product.name } : null,
    unitPrice: getRawPrice(product),
    currencyCode: product.prices.currency_code,
    quantity: clampQuantity(quantity, maxQuantity),
    maxQuantity,
    soldIndividually: Boolean(product.sold_individually),
  };
}

export function addItemToBag(items: BagItem[], item: BagItem): BagItem[] {
  const existing = items.find((line) => line.productId === item.productId);

  if (!existing) {
    return [...items, item];
  }

  return setItemQuantity(items, item.productId, existing.quantity + item.quantity);
}

export function removeItemFromBag(items: BagItem[], productId: number): BagItem[] {
  return items.filter((line) => line.productId !== productId);
}

export function setItemQuantity(
  items: BagItem[],
  productId: number,
  quantity: number,
): BagItem[] {
  return items.flatMap((line) => {
    if (line.productId !== productId) return [line];

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
