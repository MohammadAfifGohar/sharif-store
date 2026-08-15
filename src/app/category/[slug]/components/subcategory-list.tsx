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
    <section className="border-b border-border bg-background">
      <nav
        aria-label={`${parentName} product types`}
        className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8"
      >
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible">
          {subcategories.map((subcategory) => {
            const name = subcategory.name.replaceAll("&amp;", "&");

            return (
              <Link
                key={subcategory.id}
                href={`/category/${encodeURIComponent(subcategory.slug)}`}
                className="group w-20 shrink-0 snap-start sm:w-28"
              >
                <span className="relative block size-20 overflow-hidden rounded-full border border-border bg-secondary sm:size-28">
                  {subcategory.image ? (
                    <Image
                      src={subcategory.image.src}
                      alt={subcategory.image.alt || name}
                      fill
                      sizes="(max-width: 639px) 80px, 112px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid h-full place-items-center bg-gradient-to-br from-secondary to-muted font-heading text-3xl font-semibold text-primary">
                      {name.charAt(0)}
                    </span>
                  )}

                  {subcategory.count === 0 ? (
                    <Badge
                      variant="secondary"
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px]"
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
      </nav>
    </section>
  );
}
