import { ProductCard } from "@/components/product-card";
import type { ProductCardItem } from "@/lib/product-variants";

type NewArrivalsGridProps = {
  items: ProductCardItem[];
};

export function NewArrivalsGrid({ items }: NewArrivalsGridProps) {
  const categorizedItems = items.filter(
    (item) => item.product.categories.length > 0,
  );

  return (
    <section className="bg-background" aria-label="Newest products">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        {categorizedItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
            {categorizedItems.map((item) => (
              <ProductCard
                key={`${item.product.id}-${item.variant?.id ?? "base"}`}
                product={item.product}
                categorySlug={item.product.categories[0].slug}
                variant={item.variant}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-muted/30 px-6 py-14 text-center">
            <h2 className="font-heading text-2xl font-semibold">
              New products are on the way
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Products added in WooCommerce will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
