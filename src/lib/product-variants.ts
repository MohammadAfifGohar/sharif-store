import { getProductVariations, type WooProduct } from "@/lib/woocommerce";

export type VariantAttribute = {
  name: string;
  terms: string[];
};

/** The subset of a product's attributes that actually distinguish its variations. */
export function getVariantAttributes(product: WooProduct): VariantAttribute[] {
  return product.attributes
    .filter((attribute) => attribute.has_variations)
    .map((attribute) => ({
      name: attribute.name,
      terms: attribute.terms.map((term) => term.name),
    }));
}

/** Parses WooCommerce's "size: 100 ml" / "size: 100 ml, color: red" summary into a lookup, keyed lower-case. */
export function parseVariationSummary(
  variation: string | undefined,
): Record<string, string> {
  if (!variation) return {};

  return Object.fromEntries(
    variation
      .split(",")
      .map((pair) => pair.split(":"))
      .filter((pair): pair is [string, string] => pair.length === 2)
      .map(([name, value]) => [name.trim().toLowerCase(), value.trim()]),
  );
}

/** Human-readable label (e.g. "Size: 100 ml") using the product's own attribute-name casing. */
export function getVariationLabel(
  product: WooProduct,
  selected: Record<string, string>,
): string {
  return product.attributes
    .filter((attribute) => attribute.has_variations)
    .map((attribute) => {
      const value = selected[attribute.name.toLowerCase()];
      return value ? `${attribute.name}: ${value}` : null;
    })
    .filter((part): part is string => part !== null)
    .join(", ");
}

/** Finds the variation whose attributes match every entry in `selected`. */
export function resolveVariation(
  variations: WooProduct[],
  selected: Record<string, string>,
): WooProduct | null {
  const selectedEntries = Object.entries(selected);
  if (selectedEntries.length === 0) return null;

  return (
    variations.find((variation) => {
      const summary = parseVariationSummary(variation.variation);
      return selectedEntries.every(
        ([name, value]) => summary[name.toLowerCase()] === value,
      );
    }) ?? null
  );
}

/** The default selection to pre-fill the picker with — the first variation's own attributes. */
export function getDefaultSelection(
  variations: WooProduct[],
): Record<string, string> {
  const first = variations[0];
  if (!first) return {};

  return parseVariationSummary(first.variation);
}

export type ProductCardVariant = {
  id: number;
  /** "Size: 100 ml" — for the bag line and WhatsApp message. */
  label: string;
  /** "100 ml" — compact, for the card badge. */
  shortLabel: string;
  /** The resolved variation itself — its own price/stock/images. */
  data: WooProduct;
};

export type ProductCardItem = {
  /** The parent product — id/name/slug/categories/routing. */
  product: WooProduct;
  /** Every resolved variation for a variable product; empty for a simple product. */
  variants: ProductCardVariant[];
};

/**
 * Builds one card per product: simple products carry no variants, variable
 * products carry all of their resolved variations (each with its own
 * price/stock/image) for the card to switch between via its size picker.
 * Pure — takes an already-fetched variations lookup rather than fetching
 * itself, so it's unit-testable without network mocking.
 */
export function buildProductCardItems(
  products: WooProduct[],
  variationsByProductId: Map<number, WooProduct[]>,
): ProductCardItem[] {
  return products.map((product): ProductCardItem => {
    const variations = product.has_options
      ? variationsByProductId.get(product.id) ?? []
      : [];

    const variants = variations.map((variation) => {
      const selected = parseVariationSummary(variation.variation);

      return {
        id: variation.id,
        label: getVariationLabel(product, selected),
        shortLabel: Object.values(selected).join(" / "),
        data: variation,
      };
    });

    return { product, variants };
  });
}

/** Fetches each variable product's variations, then delegates to `buildProductCardItems`. */
export async function expandProductsForGrid(
  products: WooProduct[],
): Promise<ProductCardItem[]> {
  const variableProducts = products.filter((product) => product.has_options);
  const entries = await Promise.all(
    variableProducts.map(
      async (product) => [product.id, await getProductVariations(product)] as const,
    ),
  );

  return buildProductCardItems(products, new Map(entries));
}
