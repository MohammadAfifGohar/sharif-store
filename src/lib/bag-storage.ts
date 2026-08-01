import { z } from "zod";

import type { BagItem } from "@/lib/bag";

export const BAG_STORAGE_KEY = "sharif-store:bag:v1";

const bagItemSchema = z.object({
  productId: z.number(),
  variationId: z.number().nullable().default(null),
  variationLabel: z.string().nullable().default(null),
  slug: z.string(),
  categorySlug: z.string(),
  name: z.string(),
  image: z.object({ src: z.string(), alt: z.string() }).nullable(),
  unitPrice: z.number(),
  currencyCode: z.string(),
  quantity: z.number().int().positive(),
  maxQuantity: z.number().int().positive().nullable(),
  soldIndividually: z.boolean(),
}) satisfies z.ZodType<BagItem>;

const bagItemsSchema = z.array(bagItemSchema);

/** Parses persisted bag JSON, discarding anything that doesn't match the current shape. */
export function parseBagItems(raw: string | null): BagItem[] {
  if (!raw) return [];

  try {
    const result = bagItemsSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function readBagFromStorage(): BagItem[] {
  if (typeof window === "undefined") return [];

  return parseBagItems(window.localStorage.getItem(BAG_STORAGE_KEY));
}

export function writeBagToStorage(items: BagItem[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage may be unavailable (quota exceeded, private browsing) — the
    // in-memory bag state still works for the current session.
  }
}
