import type { Metadata } from "next";

import { NotFoundState } from "@/components/not-found-state";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogResults } from "@/components/catalog-results";
import { parseCatalogQuery } from "@/lib/catalog-query";
import { parseSearchQuery } from "@/lib/product-search";
import { expandProductsForGrid } from "@/lib/product-variants";
import { searchProducts } from "@/lib/woocommerce";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
    sort?: string | string[];
    availability?: string | string[];
  }>;
};

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
  const { page: requestedPage, ...options } = parseCatalogQuery(
    params,
    "relevance",
  );

  if (!query) {
    return (
      <>
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Search" }]} />
        </div>
        <NotFoundState
          eyebrow="Search"
          title="Search Sharif Store"
          description="Use the search bar above to find products by name."
        />
      </>
    );
  }

  const { products, total, totalPages, page } = await searchProducts(
    query,
    requestedPage,
    12,
    options,
  );
  const categorizedProducts = products.filter(
    (product) => product.categories.length > 0,
  );
  const cardItems = await expandProductsForGrid(categorizedProducts);

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Search" }]} />
      </div>
      <CatalogResults
        title={`Results for “${query}”`}
        eyebrow="Search"
        items={cardItems}
        total={total}
        page={page}
        totalPages={totalPages}
        basePath="/search"
        query={query}
        options={options}
        defaultSort="relevance"
      />
    </main>
  );
}
