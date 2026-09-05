import { RelatedProductsCarousel } from "./product-related-carousel";
import { expandProductsForGrid } from "@/lib/product-variants";
import { getRelatedProducts } from "@/lib/woocommerce-admin";
import { type WooProduct } from "@/lib/woocommerce";

type RelatedProductsProps = {
  product: WooProduct;
};

export async function RelatedProducts({ product }: RelatedProductsProps) {
  const related = await getRelatedProducts(product, 12);
  const items = await expandProductsForGrid(
    related.filter((item) => item.categories.length > 0),
  );

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="related-products-heading"
      className="mt-14 border-t border-border pt-10 sm:mt-20 sm:pt-14"
    >
      <div className="mb-7 sm:mb-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          You may also like
        </p>
        <h2
          id="related-products-heading"
          className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Similar products
        </h2>
      </div>

      <RelatedProductsCarousel items={items} />
    </section>
  );
}
