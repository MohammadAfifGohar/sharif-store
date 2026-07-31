import { formatPrice, type WooProduct } from "@/lib/woocommerce";

export type SearchResultItem = {
  id: number;
  name: string;
  slug: string;
  categorySlug: string;
  image: { src: string; alt: string } | null;
  priceDisplay: string;
  isInStock: boolean;
};

export function toSearchResult(product: WooProduct): SearchResultItem {
  const image = product.images[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categorySlug: product.categories[0]?.slug ?? "",
    image: image ? { src: image.src, alt: image.alt || product.name } : null,
    priceDisplay: formatPrice(product),
    isInStock: product.is_in_stock,
  };
}

/** Trims and coalesces a Next.js `searchParams` value into a single query string. */
export function parseSearchQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}
