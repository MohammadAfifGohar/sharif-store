import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { ProductGallery } from "./components/product-gallery";
import { ProductReviews, ProductReviewsSkeleton } from "./components/product-reviews";
import { RatingStars } from "@/components/rating-stars";
import {
  getProductMetadata,
  getProductRouteData,
  getProductStaticParams,
  getProductViewModel,
} from "./utils/product-route";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { SaleBadge } from "@/components/sale-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
      <Link
        href={`/category/${category.slug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to {category.name}
      </Link>

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

          <div className="mt-5 flex items-baseline gap-3 text-lg sm:text-xl">
            <span className="font-bold">{view.productPrice}</span>
            {product.on_sale ? (
              <span className="text-muted-foreground line-through">
                {view.regularPrice}
              </span>
            ) : null}
          </div>

          {view.shortDescription ? (
            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
              {view.shortDescription}
            </p>
          ) : null}

          <Separator className="my-6" />
          <p className="max-w-xl leading-7 text-muted-foreground">
            {view.description}
          </p>

          <p
            className={cn(
              "flex items-center gap-2 text-sm font-semibold my-6",
              !view.isInStock && "text-destructive",
            )}
          >
            <CheckIcon className="size-4" />
            {view.stockLabel}
            {view.isInStock && view.lowStockRemaining ? (
              <span className="font-normal text-muted-foreground">
                ({view.lowStockRemaining} left)
              </span>
            ) : null}
          </p>

          <a
            href={view.whatsAppOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            <WhatsAppIcon data-icon="inline-start" className="text-[#25d366]" />
            Order on WhatsApp
          </a>

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

          {product.attributes.length > 0 ? (
            <div className="mt-6 space-y-3 border-t border-border pt-6">
              {product.attributes.map((attribute) => (
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
