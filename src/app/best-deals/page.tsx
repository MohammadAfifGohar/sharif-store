import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BadgePercentIcon,
} from "lucide-react";

import { BestDealsBanner } from "./components/best-deals-banner";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import { expandProductsForGrid } from "@/lib/product-variants";
import { getSaleProducts } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

type BestDealsPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

function parsePage(value: string | string[] | undefined) {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({
  searchParams,
}: BestDealsPageProps): Promise<Metadata> {
  const query = await searchParams;
  const page = parsePage(query.page);
  const canonical = page > 1 ? `/best-deals?page=${page}` : "/best-deals";
  const title = page > 1 ? `Best Deals - Page ${page}` : "Best Deals";

  return {
    title,
    description:
      "Shop current sale products and limited-time offers from Sharif Store.",
    alternates: { canonical },
    openGraph: {
      title,
      description:
        "Shop current sale products and limited-time offers from Sharif Store.",
      url: canonical,
    },
  };
}

export default async function BestDealsPage({
  searchParams,
}: BestDealsPageProps) {
  const query = await searchParams;
  const requestedPage = parsePage(query.page);
  const { products, page, total, totalPages } =
    await getSaleProducts(requestedPage);
  const categorizedProducts = products.filter(
    (product) => product.categories.length > 0,
  );
  const cardItems = (await expandProductsForGrid(categorizedProducts)).filter(
    (item) => (item.variant ? item.variant.data.on_sale : item.product.on_sale),
  );

  return (
    <main className="flex-1 bg-[#fffafc]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Best deals" }]} />
      </div>
      <BestDealsBanner />

      <section
        aria-label="Products currently on sale"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
      >
        {cardItems.length > 0 ? (
          <>
            <div className="mb-7 flex items-end justify-between gap-5 sm:mb-9">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Current offers
                </p>
                <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  Shop the sale edit
                </h2>
              </div>
              <p className="shrink-0 text-right text-sm text-muted-foreground">
                {total} sale {total === 1 ? "product" : "products"}
                {totalPages > 1 ? (
                  <span className="block text-xs">
                    Page {page} of {totalPages}
                  </span>
                ) : null}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
              {cardItems.map((item) => (
                <ProductCard
                  key={`${item.product.id}-${item.variant?.id ?? "base"}`}
                  product={item.product}
                  categorySlug={item.product.categories[0].slug}
                  variant={item.variant}
                />
              ))}
            </div>

            {totalPages > 1 ? (
              <nav
                aria-label="Best deals pagination"
                className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-7"
              >
                {page > 1 ? (
                  <Link
                    href={`/best-deals?page=${page - 1}`}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    <ArrowLeftIcon aria-hidden="true" />
                    Previous
                  </Link>
                ) : (
                  <span />
                )}
                {page < totalPages ? (
                  <Link
                    href={`/best-deals?page=${page + 1}`}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Next
                    <ArrowRightIcon aria-hidden="true" />
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        ) : (
          <div className="rounded-3xl border border-border bg-background px-6 py-16 text-center shadow-sm sm:py-20">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-primary">
              <BadgePercentIcon aria-hidden="true" />
            </span>
            <h2 className="mt-6 font-heading text-2xl font-semibold sm:text-3xl">
              No deals are live right now
            </h2>
            <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
              Sale products enabled in WooCommerce will appear here
              automatically.
            </p>
            <Link
              href="/#categories"
              className={cn(buttonVariants({ size: "lg" }), "mt-7")}
            >
              Browse all categories
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
