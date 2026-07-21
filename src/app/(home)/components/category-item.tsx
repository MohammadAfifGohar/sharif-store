import Image from "next/image";
import Link from "next/link";

import type { WooCategory } from "@/lib/woocommerce";
import { getCategoryPath } from "../utils/routes";

export function CategoryItem({ category }: { category: WooCategory }) {
  const categoryName = category.name.replaceAll("&amp;", "&");

  return (
    <Link
      href={getCategoryPath(category.slug)}
      className="group flex w-20 shrink-0 snap-start flex-col gap-1.5 sm:w-32 sm:gap-2.5"
    >
      <span className="relative block size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary sm:size-32 sm:rounded-xl">
        {category.image ? (
          <Image
            src={category.image.src}
            alt={category.image.alt || categoryName}
            fill
            sizes="(max-width: 639px) 80px, 128px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full place-items-center bg-gradient-to-br from-secondary to-muted font-heading text-4xl font-semibold text-primary">
            {categoryName.charAt(0)}
          </span>
        )}
      </span>
      <span className="px-1 text-center">
        <span className="line-clamp-2 min-h-8 font-heading text-xs font-semibold leading-4 sm:min-h-10 sm:text-sm sm:leading-5">
          {categoryName}
        </span>
        <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground sm:mt-1 sm:text-[10px] sm:tracking-[0.12em]">
          {category.count} {category.count === 1 ? "find" : "finds"}
        </span>
      </span>
    </Link>
  );
}
