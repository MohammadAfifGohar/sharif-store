import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { ProductGallery } from "./components/product-gallery";
import { ProductPurchasePanel } from "./components/product-purchase-panel";
import { ProductReviews, ProductReviewsSkeleton } from "./components/product-reviews";
import { RatingStars } from "@/components/rating-stars";
import {
  getProductMetadata,
  getProductRouteData,
  getProductStaticParams,
  getProductViewModel,
} from "./utils/product-route";
import { SaleBadge } from "@/components/sale-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

  const { category, product, variations } = data;
  const view = getProductViewModel(data);
  const attributesExcludingVariants = product.attributes.filter(
    (attribute) => !attribute.has_variations,
  );

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-8 pb-24 sm:px-6 sm:py-12 lg:px-10 lg:py-16 lg:pb-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="shrink-0 transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRightIcon className="size-3.5 shrink-0" aria-hidden="true" />
        <Link
          href={`/category/${category.slug}`}
          className="shrink-0 transition-colors hover:text-foreground"
        >
          {category.name}
        </Link>
        <ChevronRightIcon className="size-3.5 shrink-0" aria-hidden="true" />
        <span
          aria-current="page"
          className="truncate font-medium text-foreground"
        >
          {product.name}
        </span>
      </nav>

      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <section className="min-w-0">
          <ProductGallery images={product.images} productName={product.name} />
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
            product={product}
            categorySlug={category.slug}
            productPath={view.productPath}
            variations={variations}
            variantAttributes={view.variantAttributes}
            productPrice={view.productPrice}
            regularPrice={view.regularPrice}
            priceRangeDisplay={view.priceRangeDisplay}
            savingsDisplay={view.savingsDisplay}
            isInStock={view.isInStock}
            stockLabel={view.stockLabel}
            lowStockRemaining={view.lowStockRemaining}
            whatsAppOrderUrl={view.whatsAppOrderUrl}
          />

          {view.shortDescription ? (
            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
              {view.shortDescription}
            </p>
          ) : null}

          <Separator className="my-6" />
          <p className="max-w-xl leading-7 text-muted-foreground">
            {view.description}
          </p>

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

          {attributesExcludingVariants.length > 0 ? (
            <div className="mt-6 space-y-3 border-t border-border pt-6">
              {attributesExcludingVariants.map((attribute) => (
                <div key={attribute.id} className="text-sm">
                  <p className="font-semibold">{attribute.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {attribute.terms.map((term) => (
                      <Badge key={term.id} variant="secondary">
                        {term.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
