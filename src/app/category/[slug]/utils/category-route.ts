import type { Metadata } from "next";

import {
  getCategoryPageData,
  getStoreCategories,
} from "@/lib/woocommerce";

export async function getCategoryStaticParams() {
  const categories = await getStoreCategories();

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function getCategoryMetadata(slug: string): Promise<Metadata> {
  const data = await getCategoryPageData(slug);

  if (!data) {
    return {
      title: "Category not found",
      robots: { index: false, follow: false },
    };
  }

  const title = data.category.name;
  const description = `Shop ${data.category.name} products at The Sharif Store. Discover carefully selected everyday beauty, fragrance, gifting and personal-care picks.`;
  const path = `/category/${encodeURIComponent(data.category.slug)}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      images: data.category.image
        ? [{ url: data.category.image.src, alt: data.category.name }]
        : undefined,
    },
  };
}
