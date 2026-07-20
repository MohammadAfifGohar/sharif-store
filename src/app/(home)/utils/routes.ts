export function getCategoryPath(slug: string) {
  return `/category/${encodeURIComponent(slug)}`;
}
