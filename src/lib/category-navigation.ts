import type { WooCategory } from "@/lib/woocommerce";

export type CategoryNavigationItem = {
  id: number;
  name: string;
  slug: string;
  children: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

export function getCategoryPath(slug: string) {
  return `/category/${encodeURIComponent(slug)}`;
}

export function buildCategoryNavigation(
  categories: WooCategory[],
): CategoryNavigationItem[] {
  const childrenByParent = new Map<number, WooCategory[]>();

  for (const category of categories) {
    if (category.parent === 0) continue;
    const siblings = childrenByParent.get(category.parent) ?? [];
    siblings.push(category);
    childrenByParent.set(category.parent, siblings);
  }

  return categories
    .filter((category) => category.parent === 0)
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      children: (childrenByParent.get(category.id) ?? []).map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
      })),
    }));
}

