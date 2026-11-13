/**
 * WordPress stores non-ASCII slugs (e.g. a trailing 🍉) percent-encoded, as
 * `...-%f0%9f%8d%89`. Decode once so links, route params and lookups all
 * compare the same human-readable form. Malformed sequences are left as-is.
 */
export function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/**
 * Build the canonical storefront path for a WooCommerce product.
 */
export function getProductPath(categorySlug: string, productSlug: string) {
  return `/category/${encodeURIComponent(decodeSlug(categorySlug))}/${encodeURIComponent(decodeSlug(productSlug))}`;
}
