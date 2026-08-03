import type { MetadataRoute } from "next";

import { getProductPath } from "@/lib/product-route";
import { absoluteUrl } from "@/lib/site-config";
import { getStoreCategories, getStoreProducts } from "@/lib/woocommerce";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/new-arrivals"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/best-deals"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const [categories, products] = await Promise.all([
      getStoreCategories(),
      getStoreProducts(),
    ]);
    const seen = new Set(staticEntries.map((entry) => entry.url));
    const dynamicEntries: MetadataRoute.Sitemap = [];

    for (const category of categories) {
      const url = absoluteUrl(`/category/${encodeURIComponent(category.slug)}`);
      if (seen.has(url)) continue;
      seen.add(url);
      dynamicEntries.push({ url, changeFrequency: "weekly", priority: 0.8 });
    }

    for (const product of products) {
      const category = product.categories[0];
      if (!category) continue;
      const url = absoluteUrl(getProductPath(category.slug, product.slug));
      if (seen.has(url)) continue;
      seen.add(url);
      dynamicEntries.push({ url, changeFrequency: "weekly", priority: 0.7 });
    }

    return [...staticEntries, ...dynamicEntries];
  } catch {
    return staticEntries;
  }
}
