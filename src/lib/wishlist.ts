import { z } from "zod";

/**
 * The wishlist is kept in the shopper's browser (like the bag), so it works
 * without logging in. Only product IDs are stored; names, prices, photos and
 * stock are always loaded fresh when the wishlist is shown.
 */
export const WISHLIST_STORAGE_KEY = "sharif-store:wishlist:v1";

/** Keeps storage small and the wishlist page a single request. */
export const WISHLIST_LIMIT = 100;

export type WishlistEntry = {
  productId: number;
  /** Category the product was saved from, for its link. */
  categorySlug: string;
  addedAt: number;
};

const entrySchema = z.object({
  productId: z.number().int().positive(),
  categorySlug: z.string().max(200),
  addedAt: z.number(),
}) satisfies z.ZodType<WishlistEntry>;

/** Parses stored wishlist JSON, dropping anything that doesn't fit. */
export function parseWishlist(raw: string | null): WishlistEntry[] {
  if (!raw) return [];
  try {
    const result = z.array(entrySchema).safeParse(JSON.parse(raw));
    if (!result.success) return [];
    const seen = new Set<number>();
    return result.data
      .filter((entry) => !seen.has(entry.productId) && seen.add(entry.productId))
      .slice(0, WISHLIST_LIMIT);
  } catch {
    return [];
  }
}

export function isInWishlist(entries: WishlistEntry[], productId: number) {
  return entries.some((entry) => entry.productId === productId);
}

/** Adds the product (newest first) or removes it if it is already saved. */
export function toggleWishlistEntry(
  entries: WishlistEntry[],
  productId: number,
  categorySlug: string,
  now = Date.now(),
): WishlistEntry[] {
  if (isInWishlist(entries, productId)) {
    return entries.filter((entry) => entry.productId !== productId);
  }
  return [{ productId, categorySlug, addedAt: now }, ...entries].slice(0, WISHLIST_LIMIT);
}

export function removeWishlistEntries(entries: WishlistEntry[], productIds: number[]) {
  const remove = new Set(productIds);
  return entries.filter((entry) => !remove.has(entry.productId));
}
