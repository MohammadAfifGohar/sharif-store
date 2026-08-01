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
  getProductRouteData,
  getProductStaticParams,
  getProductViewModel,
} from "./utils/product-route";
import { SaleBadge } from "@/components/sale-badge";
import { Badge } from "@/components/ui/badge";
import { getProductVariations } from "@/lib/woocommerce";

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
    product.type === "variable" ? await getProductVariations(product.id) : [];

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: category.name, href: `/category/${category.slug}` },
          { label: product.name },
        ]}
      />

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

          <h1 className="mt-4 font-heading text-3xl font-semibold capitalize tracking-tight sm:text-5xl">
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
