import type { WooProduct } from "@/lib/woocommerce";

/** Select the first renderable product from an already ordered collection. */
export function selectFirstProductWithImage(products: WooProduct[]) {
  return products.find((product) => product.images.length > 0) ?? null;
}

