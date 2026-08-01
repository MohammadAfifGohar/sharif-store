import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategoryPageData } from "@/lib/woocommerce";
import { Breadcrumbs } from "@/components/breadcrumbs";
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

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: category.name }]} />
      </div>
      <SubcategoryList
        parentName={category.name}
        subcategories={subcategories}
      />
      <ProductGrid products={products} categorySlug={category.slug} />
    </main>
  );
}
