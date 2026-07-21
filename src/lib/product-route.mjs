/**
 * Build the canonical storefront path for a WooCommerce product.
 *
 * @param {string} categorySlug
 * @param {string} productSlug
 */
export function getProductPath(categorySlug, productSlug) {
  return `/category/${encodeURIComponent(categorySlug)}/${encodeURIComponent(productSlug)}`;
}
