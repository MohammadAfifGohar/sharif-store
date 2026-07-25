/**
 * Build the canonical storefront path for a WooCommerce product.
 */
export function getProductPath(categorySlug: string, productSlug: string) {
  return `/category/${encodeURIComponent(categorySlug)}/${encodeURIComponent(productSlug)}`;
}
