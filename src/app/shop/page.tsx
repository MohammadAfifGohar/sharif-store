import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogResults } from "@/components/catalog-results";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog-feed";
import { parseCatalogQuery } from "@/lib/catalog-query";
import { expandProductsForGrid } from "@/lib/product-variants";
import { getAllProductsListing } from "@/lib/woocommerce";

type ShopPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    sort?: string | string[];
    availability?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse every product at The Sharif Store in one place: toys, beauty, gifts and everyday essentials.",
  alternates: { canonical: "/shop" },
};

/**
 * The whole catalogue in one scrolling list, so shoppers can browse without
 * having to pick a category first. Newest first by default.
 */
export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { page: requestedPage, ...options } = parseCatalogQuery(
    await searchParams,
    "newest",
  );
  const { products, total, totalPages, page } = await getAllProductsListing(
    requestedPage,
    CATALOG_PAGE_SIZE,
    options,
  );
  const items = await expandProductsForGrid(
    products.filter((product) => product.categories.length > 0),
  );

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "All products" }]} />
      </div>
      <CatalogResults
        title="All products"
        eyebrow="Shop"
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        source={{ kind: "all", options }}
        basePath="/shop"
        options={options}
        defaultSort="newest"
      />
    </main>
  );
}
