import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { NotFoundState } from "@/components/not-found-state";
import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import { parseSearchQuery } from "@/lib/product-search";
import { searchProducts } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
};

function parsePage(value: string | string[] | undefined) {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = parseSearchQuery((await searchParams).q);

  return {
    title: query ? `Search results for "${query}"` : "Search",
    robots: { index: false, follow: false },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = parseSearchQuery(params.q);
  const requestedPage = parsePage(params.page);

  if (!query) {
    return (
      <NotFoundState
        eyebrow="Search"
        title="Search Sharif Store"
        description="Use the search bar above to find products by name."
      />
    );
  }

  const { products, total, totalPages, page } = await searchProducts(
    query,
    requestedPage,
  );
  const categorizedProducts = products.filter(
    (product) => product.categories.length > 0,
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mb-7 flex items-end justify-between gap-5 sm:mb-9">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Search
          </p>
          <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Results for &ldquo;{query}&rdquo;
          </h1>
        </div>
        <p className="shrink-0 text-right text-sm text-muted-foreground">
          {total} {total === 1 ? "product" : "products"}
          {totalPages > 1 ? (
            <span className="block text-xs">
              Page {page} of {totalPages}
            </span>
          ) : null}
        </p>
      </div>

      {categorizedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
            {categorizedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categorySlug={product.categories[0].slug}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              aria-label="Search results pagination"
              className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-7"
            >
              {page > 1 ? (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
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
                  href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
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
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            No results for &ldquo;{query}&rdquo;
          </h2>
          <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
            Try a different search term, or browse our categories instead.
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
    </main>
  );
}
