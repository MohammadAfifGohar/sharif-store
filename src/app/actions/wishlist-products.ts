"use server";

import { expandProductsForGrid, type ProductCardItem } from "@/lib/product-variants";
import { WISHLIST_LIMIT } from "@/lib/wishlist";
import { getProductsByIds } from "@/lib/woocommerce";

/**
 * Fresh product cards for the IDs saved in a shopper's wishlist. Products
 * that were removed or hidden from the store are simply not returned.
 * Returns null when the store could not be reached, so the browser keeps the
 * list as it is instead of treating every product as gone.
 */
export async function loadWishlistProducts(ids: unknown): Promise<ProductCardItem[] | null> {
  if (!Array.isArray(ids)) return [];
  const safeIds = [
    ...new Set(ids.filter((id): id is number => Number.isInteger(id) && id > 0)),
  ].slice(0, WISHLIST_LIMIT);
  if (!safeIds.length) return [];

  try {
    const products = await getProductsByIds(safeIds);
    return await expandProductsForGrid(products.filter((product) => product.categories.length > 0));
  } catch (cause) {
    console.error("[wishlist] could not load products", cause);
    return null;
  }
}
