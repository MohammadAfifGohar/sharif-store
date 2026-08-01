import type { Metadata } from "next";

import {
  formatMoneyAmount,
  formatPrice,
  formatPriceRange,
  formatRegularPrice,
  getProductBySlug,
  getProductVariations,
  getSavingsAmount,
  getStoreProducts,
  type WooProduct,
} from "@/lib/woocommerce";
import { getVariantAttributes, type VariantAttribute } from "@/lib/product-variants";
import { textFromHtml } from "@/lib/html-text";
import { getProductPath } from "@/lib/product-route";
import { absoluteUrl } from "@/lib/site-config";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp-order";

type RouteCategory = WooProduct["categories"][number];

/**
 * The category a product canonicalises to. A product can live in several
 * categories (and thus be reachable at several URLs); we pick a single stable
 * one — its first category — so every variant points at one canonical URL.
 */
function getPrimaryCategory(product: WooProduct): RouteCategory | null {
  return product.categories[0] ?? null;
}

type ProductSpec = {
  label: string;
  value: string;
};

export type ProductRouteData = {
  category: RouteCategory;
  product: WooProduct;
  variations: WooProduct[];
};

export type ProductViewModel = {
  discountPercent: number;
  description: string;
  shortDescription: string;
  productPath: string;
  productPrice: string;
  regularPrice: string;
  priceRangeDisplay: string | null;
  savingsDisplay: string | null;
  variantAttributes: VariantAttribute[];
  averageRating: number;
  hasRating: boolean;
  isInStock: boolean;
  stockLabel: string;
  lowStockRemaining: number | null;
  specs: ProductSpec[];
  whatsAppOrderUrl: string;
};

/**
 * Resolves a product for the `/category/[slug]/[productSlug]` route, ensuring
 * the product actually belongs to the category in the URL.
 */
export async function getProductRouteData(
  categorySlug: string,
  productSlug: string,
): Promise<ProductRouteData | null> {
  const product = await getProductBySlug(productSlug);

  if (!product) return null;

  const category = product.categories.find(
    (item) => item.slug === categorySlug,
  );

  if (!category) return null;

  const variations = await getProductVariations(product);

  return { category, product, variations };
}

export async function getProductMetadata(
  categorySlug: string,
  productSlug: string,
): Promise<Metadata> {
  const data = await getProductRouteData(categorySlug, productSlug);

  if (!data) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const { product } = data;
  const description = textFromHtml(product.short_description) || undefined;
  // Canonicalise every category variant of this product to one stable URL.
  const canonicalCategory = getPrimaryCategory(product) ?? data.category;
  const canonical = getProductPath(canonicalCategory.slug, product.slug);
  const image = product.images[0];

  return {
    title: product.name,
    description,
    alternates: { canonical },
    openGraph: {
      title: product.name,
      description,
      url: canonical,
      images: image ? [{ url: image.src, alt: image.alt || product.name }] : undefined,
    },
  };
}

/**
 * Pre-renders product pages at build time. Each product is emitted under its
 * primary category so the generated path matches the canonical URL.
 */
export async function getProductStaticParams() {
  const products = await getStoreProducts();

  return products
    .map((product) => {
      const category = getPrimaryCategory(product);
      return category
        ? { slug: category.slug, productSlug: product.slug }
        : null;
    })
    .filter((params): params is { slug: string; productSlug: string } =>
      params !== null,
    );
}

function getProductSpecs(product: WooProduct): ProductSpec[] {
  const specs: Array<ProductSpec | null> = [
    product.sku ? { label: "SKU", value: product.sku } : null,
    product.formatted_weight && product.formatted_weight !== "N/A"
      ? { label: "Weight", value: product.formatted_weight }
      : null,
    product.formatted_dimensions && product.formatted_dimensions !== "N/A"
      ? { label: "Dimensions", value: product.formatted_dimensions }
      : null,
  ];

  return specs.filter((spec): spec is ProductSpec => spec !== null);
}

/**
 * Derives everything the product page needs to render from the raw WooCommerce
 * product, keeping the page component purely presentational.
 */
export function getProductViewModel({
  category,
  product,
}: ProductRouteData): ProductViewModel {
  const productPath = getProductPath(category.slug, product.slug);
  const productPrice = formatPrice(product);
  const priceRangeDisplay = formatPriceRange(product);
  const savings = getSavingsAmount(product);
  const savingsDisplay =
    savings > 0
      ? formatMoneyAmount(savings, product.prices.currency_code)
      : null;
  const averageRating = Number(product.average_rating);
  const lowStockRemaining =
    typeof product.low_stock_remaining === "number" &&
    product.low_stock_remaining > 0
      ? product.low_stock_remaining
      : null;
  const regularPriceAmount = Number(product.prices.regular_price);
  const currentPriceAmount = Number(product.prices.price);
  const discountPercent =
    product.on_sale &&
    regularPriceAmount > 0 &&
    currentPriceAmount < regularPriceAmount
      ? Math.round(
          ((regularPriceAmount - currentPriceAmount) / regularPriceAmount) * 100,
        )
      : 0;

  return {
    discountPercent,
    description:
      textFromHtml(product.description) ||
      textFromHtml(product.short_description) ||
      "A curated pick from The Sharif Store.",
    shortDescription: textFromHtml(product.short_description),
    productPath,
    productPrice,
    regularPrice: formatRegularPrice(product),
    priceRangeDisplay,
    savingsDisplay,
    variantAttributes: getVariantAttributes(product),
    averageRating,
    hasRating: product.review_count > 0 && averageRating > 0,
    isInStock: product.is_in_stock,
    stockLabel: product.is_in_stock
      ? product.stock_availability?.text || "In stock"
      : "Currently out of stock",
    lowStockRemaining,
    specs: getProductSpecs(product),
    whatsAppOrderUrl: getWhatsAppOrderUrl({
      productName: product.name,
      price: productPrice,
      productUrl: absoluteUrl(productPath),
    }),
  };
}
