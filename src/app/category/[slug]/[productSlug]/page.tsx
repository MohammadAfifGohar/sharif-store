import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ProductGallery } from "./components/product-gallery";
import { ProductPurchasePanel } from "./components/product-purchase-panel";
import { ProductReviews, ProductReviewsSkeleton } from "./components/product-reviews";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RatingStars } from "@/components/rating-stars";
import {
  getProductMetadata,
  getCanonicalProductPath,
  getProductRouteData,
  getProductStaticParams,
  getProductViewModel,
} from "./utils/product-route";
import { SaleBadge } from "@/components/sale-badge";
import { Badge } from "@/components/ui/badge";
import { getProductPath } from "@/lib/product-route";
import { absoluteUrl } from "@/lib/site-config";
import { getProductVariations, getRawPrice } from "@/lib/woocommerce";

export async function generateStaticParams() {
  return getProductStaticParams();
}

export async function generateMetadata(
  props: PageProps<"/category/[slug]/[productSlug]">,
): Promise<Metadata> {
  const { slug, productSlug } = await props.params;
  return getProductMetadata(slug, productSlug);
}

export default async function CategoryProductPage(
  props: PageProps<"/category/[slug]/[productSlug]">,
) {
  const { slug, productSlug } = await props.params;
  const data = await getProductRouteData(slug, productSlug);

  if (!data) notFound();

  const { category, product } = data;
  const view = getProductViewModel(data);
  const variations =
    product.type === "variable" ? await getProductVariations(product) : [];
  const canonicalPath =
    getCanonicalProductPath(product) ??
    getProductPath(category.slug, product.slug);
  const canonicalCategory = product.categories[0] ?? category;
  const aggregateRating = view.hasRating
    ? {
        "@type": "AggregateRating",
        ratingValue: view.averageRating,
        reviewCount: product.review_count,
      }
    : undefined;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((image) => image.src),
    description: view.description,
    sku: product.sku || undefined,
    brand: product.brands[0]
      ? { "@type": "Brand", name: product.brands[0].name }
      : undefined,
    aggregateRating,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(canonicalPath),
      priceCurrency: product.prices.currency_code,
      price: getRawPrice(product).toFixed(product.prices.currency_minor_unit),
      availability: product.is_in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: canonicalCategory.name,
        item: absoluteUrl(`/category/${canonicalCategory.slug}`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: absoluteUrl(canonicalPath),
      },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 pb-24 sm:px-6 sm:pb-12 lg:px-10 lg:pb-16">
      {[productSchema, breadcrumbSchema].map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      ))}
      <div className="py-4">
        <Breadcrumbs
          items={[
            { label: category.name, href: `/category/${category.slug}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <section className="min-w-0">
          <ProductGallery
            images={product.images}
            productName={product.name}
            discountPercent={view.discountPercent}
          />
        </section>

        <section className="flex min-w-0 flex-col lg:sticky lg:top-28">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{category.name}</Badge>
            {product.brands.map((brand) => (
              <Badge key={brand.id} variant="outline">
                {brand.name}
              </Badge>
            ))}
            {product.on_sale ? <SaleBadge /> : null}
          </div>

          <h1 className="mt-4 font-heading text-2xl font-semibold capitalize tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {view.description}
          </p>

          {view.hasRating ? (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <RatingStars rating={view.averageRating} />
              <span className="font-semibold">
                {view.averageRating.toFixed(1)}
              </span>
              <a
                href="#product-reviews-heading"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                ({product.review_count}{" "}
                {product.review_count === 1 ? "review" : "reviews"})
              </a>
            </div>
          ) : null}

          <ProductPurchasePanel
            categorySlug={category.slug}
            product={product}
            variations={variations}
          />

          {view.specs.length > 0 ? (
            <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-border pt-6 text-sm sm:grid-cols-2">
              {view.specs.map((spec) => (
                <div key={spec.label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{spec.label}</dt>
                  <dd className="text-right font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {product.tags.length > 0 ? (
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-6">
              <span className="text-sm text-muted-foreground">Tags:</span>
              {product.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <Suspense fallback={<ProductReviewsSkeleton />}>
        <ProductReviews
          productId={product.id}
          productName={product.name}
          reviewCount={product.review_count}
          averageRating={view.averageRating}
        />
      </Suspense>
    </main>
  );
}
