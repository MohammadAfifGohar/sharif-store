"use server";

import { z } from "zod";

import type { FreshBagLine } from "@/lib/bag";
import {
  getProductById,
  getProductsByIds,
  getRawPrice,
  getSavingsAmount,
  type WooProduct,
} from "@/lib/woocommerce";

const linesSchema = z
  .array(
    z.object({
      productId: z.number().int().positive(),
      variationId: z.number().int().positive().nullable(),
    }),
  )
  .max(100);

function toFreshLine(
  productId: number,
  variationId: number | null,
  source: WooProduct | undefined,
): FreshBagLine {
  if (!source) {
    return {
      productId,
      variationId,
      available: false,
      unitPrice: 0,
      regularUnitPrice: 0,
      maxQuantity: null,
      soldIndividually: false,
    };
  }

  return {
    productId,
    variationId,
    available: source.is_in_stock && source.is_purchasable !== false,
    unitPrice: getRawPrice(source),
    regularUnitPrice: getRawPrice(source) + getSavingsAmount(source),
    maxQuantity: source.low_stock_remaining ?? null,
    soldIndividually: Boolean(source.sold_individually),
  };
}

/**
 * The store's current price and stock for each bag line, so the bag and
 * checkout never show a price saved days ago. Returns null when the store
 * could not be reached; the bag is then left as it is.
 */
export async function loadFreshBagLines(lines: unknown): Promise<FreshBagLine[] | null> {
  const parsed = linesSchema.safeParse(lines);
  if (!parsed.success || parsed.data.length === 0) return [];

  try {
    const productIds = [...new Set(parsed.data.map((line) => line.productId))];
    const products = new Map(
      (await getProductsByIds(productIds)).map((product) => [product.id, product]),
    );

    return await Promise.all(
      parsed.data.map(async ({ productId, variationId }) => {
        const product = products.get(productId);
        if (!product || variationId === null) {
          return toFreshLine(productId, variationId, product);
        }
        // A variation that was deleted makes the store answer 404.
        const variation = product.variations?.some((entry) => entry.id === variationId)
          ? await getProductById(variationId).catch(() => undefined)
          : undefined;
        return toFreshLine(productId, variationId, variation);
      }),
    );
  } catch (cause) {
    console.error("[bag] could not load current prices", cause);
    return null;
  }
}
