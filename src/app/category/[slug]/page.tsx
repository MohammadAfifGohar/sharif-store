import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogResults } from "@/components/catalog-results";
import { parseCatalogQuery } from "@/lib/catalog-query";
import { expandProductsForGrid } from "@/lib/product-variants";
import { getCategoryListingData } from "@/lib/woocommerce";
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
    12,
    options,
  );

  if (!data) notFound();

  const { category, products, subcategories, page, total, totalPages } = data;
  const items = await expandProductsForGrid(products);

  return (
    <main>
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
        basePath={`/category/${encodeURIComponent(category.slug)}`}
        options={options}
        defaultSort="newest"
        categorySlug={category.slug}
        toolbarStart={
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Explore {category.name.replaceAll("&amp;", "&")}
          </h2>
        }
      />
    </main>
  );
}
