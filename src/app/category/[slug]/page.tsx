import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogResults } from "@/components/catalog-results";
import { decodeEntities } from "@/lib/html-text";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog-feed";
import { parseCatalogQuery } from "@/lib/catalog-query";
import { expandProductsForGrid } from "@/lib/product-variants";
import { getCatalogFacets, getCategoryListingData } from "@/lib/woocommerce";
import { SubcategoryList } from "./components/subcategory-list";
import {
  getCategoryMetadata,
  getCategoryStaticParams,
} from "./utils/category-route";

export async function generateStaticParams() {
  return getCategoryStaticParams();
}

export async function generateMetadata(
  props: PageProps<"/category/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  return getCategoryMetadata(slug);
}

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  const query = await props.searchParams;
  const { page: requestedPage, ...options } = parseCatalogQuery(
    query,
    "newest",
  );
  const data = await getCategoryListingData(
    slug,
    requestedPage,
    CATALOG_PAGE_SIZE,
    options,
  );

  if (!data) notFound();

  const { category, ancestors, products, subcategories, page, total, totalPages } =
    data;
  const [items, facets] = await Promise.all([
    expandProductsForGrid(products),
    getCatalogFacets(category.id),
  ]);

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            ...ancestors.map((parent) => ({
              label: decodeEntities(parent.name),
              href: `/category/${encodeURIComponent(parent.slug)}`,
            })),
            { label: decodeEntities(category.name) },
          ]}
        />
      </div>
      <SubcategoryList
        parentName={category.name}
        subcategories={subcategories}
      />
      <CatalogResults
        title={category.name}
        hideHeader
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        source={{ kind: "category", slug: category.slug, options }}
        basePath={`/category/${encodeURIComponent(category.slug)}`}
        options={options}
        defaultSort="newest"
        categorySlug={category.slug}
        facets={facets}
        toolbarStart={
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Explore {category.name.replaceAll("&amp;", "&")}
          </h2>
        }
      />
    </main>
  );
}
