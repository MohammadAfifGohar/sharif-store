import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { expandProductsForGrid } from "@/lib/product-variants";
import { getCategoryPageData } from "@/lib/woocommerce";
import { ProductGrid } from "./components/product-grid";
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

export default async function CategoryPage(
  props: PageProps<"/category/[slug]">,
) {
  const { slug } = await props.params;
  const data = await getCategoryPageData(slug);

  if (!data) notFound();

  const { category, products, subcategories } = data;
  const items = await expandProductsForGrid(products);

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: category.name }]} />
        <div className="pb-2 pt-5 sm:pt-7">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {category.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Shop {category.name.toLowerCase()} products selected for everyday
            use, thoughtful gifting and easy local ordering.
          </p>
        </div>
      </div>
      <SubcategoryList
        parentName={category.name}
        subcategories={subcategories}
      />
      <ProductGrid items={items} categorySlug={category.slug} />
    </main>
  );
}
