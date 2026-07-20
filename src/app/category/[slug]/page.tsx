import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategoryPageData } from "@/lib/woocommerce";
import { CategoryHero } from "./components/category-hero";
import { ProductGrid } from "./components/product-grid";
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

  const { category, products } = data;

  return (
    <main>
      <CategoryHero category={category} productCount={products.length} />
      <ProductGrid products={products} />
    </main>
  );
}
