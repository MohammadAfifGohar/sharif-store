import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { SaleBadge } from "@/components/sale-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  formatPrice,
  formatRegularPrice,
  getProductBySlug,
} from "@/lib/woocommerce";
import { getProductPath } from "@/lib/product-route.mjs";
import { cn } from "@/lib/utils";

type CategoryProductPageProps = {
  params: Promise<{ slug: string; productSlug: string }>;
};

function textFromHtml(value?: string) {
  return value
    ?.replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, String.fromCharCode(39))
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

async function getRouteProduct(categorySlug: string, productSlug: string) {
  const product = await getProductBySlug(productSlug);

  if (!product) return null;

  const category = product.categories.find(
    (item) => item.slug === categorySlug,
  );

  return category ? { category, product } : null;
}

export async function generateMetadata(
  props: CategoryProductPageProps,
): Promise<Metadata> {
  const { slug, productSlug } = await props.params;
  const data = await getRouteProduct(slug, productSlug);

  if (!data) return { title: "Product not found" };

  return {
    title: data.product.name,
    description: textFromHtml(data.product.short_description) || undefined,
    alternates: {
      canonical: getProductPath(data.category.slug, data.product.slug),
    },
  };
}

export default async function CategoryProductPage(
  props: CategoryProductPageProps,
) {
  const { slug, productSlug } = await props.params;
  const data = await getRouteProduct(slug, productSlug);

  if (!data) notFound();

  const { category, product } = data;
  const image = product.images[0];
  const description =
    textFromHtml(product.description) ||
    textFromHtml(product.short_description) ||
    "A curated pick from The Sharif Store.";

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
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#f7f7f7]">
            {image ? (
              <Image
                src={image.src}
                alt={image.alt || product.name}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-contain"
              />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground">
                Product image coming soon
              </div>
            )}
          </div>
        </section>

        <section className="flex min-w-0 flex-col lg:sticky lg:top-28">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{category.name}</Badge>
            {product.on_sale ? <SaleBadge /> : null}
          </div>
          <h1 className="mt-4 font-heading text-3xl font-semibold capitalize tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <div className="mt-5 flex items-baseline gap-3 text-lg sm:text-xl">
            <span className="font-bold">{formatPrice(product)}</span>
            {product.on_sale ? (
              <span className="text-muted-foreground line-through">
                {formatRegularPrice(product)}
              </span>
            ) : null}
          </div>
          <p className="mt-6 max-w-xl leading-7 text-muted-foreground">
            {description}
          </p>
          <p className="mt-6 flex items-center gap-2 text-sm font-semibold">
            <CheckIcon className="size-4" />
            {product.is_in_stock ? "In stock" : "Currently out of stock"}
          </p>
          <Link
            href={`/category/${category.slug}`}
            className={cn(buttonVariants({ size: "lg" }), "mt-8 w-full sm:w-fit")}
          >
            Continue shopping
          </Link>
        </section>
      </div>
    </main>
  );
}
