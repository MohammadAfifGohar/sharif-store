import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { WooCategory } from "@/lib/woocommerce";

type SubcategoryListProps = {
  parentName: string;
  subcategories: WooCategory[];
};

export function SubcategoryList({
  parentName,
  subcategories,
}: SubcategoryListProps) {
  if (subcategories.length === 0) return null;

  return (
    <section
      aria-labelledby="subcategory-heading"
      className="border-b border-border bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Browse by type
        </p>
        <h2
          id="subcategory-heading"
          className="mt-2 font-heading text-2xl font-semibold sm:text-3xl"
        >
          Explore {parentName}
        </h2>

        <div className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible md:grid-cols-4 lg:grid-cols-5">
          {subcategories.map((subcategory) => {
            const name = subcategory.name.replaceAll("&amp;", "&");

            return (
              <Link
                key={subcategory.id}
                href={`/category/${encodeURIComponent(subcategory.slug)}`}
                className="group w-32 shrink-0 snap-start sm:w-auto"
              >
                <span className="relative block aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
                  {subcategory.image ? (
                    <Image
                      src={subcategory.image.src}
                      alt={subcategory.image.alt || name}
                      fill
                      sizes="(max-width: 639px) 128px, (max-width: 1023px) 30vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid h-full place-items-center bg-gradient-to-br from-secondary to-muted font-heading text-4xl font-semibold text-primary">
                      {name.charAt(0)}
                    </span>
                  )}

                  {subcategory.count === 0 ? (
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 left-2 text-[10px]"
                    >
                      Coming soon
                    </Badge>
                  ) : null}
                </span>
                <span className="mt-2 block px-1">
                  <span className="line-clamp-2 font-heading text-sm font-semibold leading-5">
                    {name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {subcategory.count}{" "}
                    {subcategory.count === 1 ? "product" : "products"}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
