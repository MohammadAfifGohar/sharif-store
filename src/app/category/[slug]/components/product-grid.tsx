import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { WooProduct } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: WooProduct[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border bg-muted/30 px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold">More products are coming</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            This collection is currently being refreshed. Explore the other
            categories while we add new picks.
          </p>
          <Link href="/" className={cn(buttonVariants(), "mt-7")}>
            Explore the store
          </Link>
        </div>
      )}
    </section>
  );
}
