import { ProductCard } from "@/components/product-card";
import type { WooProduct } from "@/lib/woocommerce";

type NewArrivalsGridProps = {
  products: WooProduct[];
};

export function NewArrivalsGrid({ products }: NewArrivalsGridProps) {
  const categorizedProducts = products.filter(
    (product) => product.categories.length > 0,
  );

  return (
    <section className="bg-background" aria-label="Newest products">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        {categorizedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
            {categorizedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categorySlug={product.categories[0].slug}
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
