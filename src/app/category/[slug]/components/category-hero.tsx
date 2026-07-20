import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { WooCategory } from "@/lib/woocommerce";

type CategoryHeroProps = {
  category: WooCategory;
  productCount: number;
};

export function CategoryHero({
  category,
  productCount,
}: CategoryHeroProps) {
  return (
    <section className="border-b border-black/5 bg-[linear-gradient(135deg,#fff8fa_0%,#f5ecef_100%)]">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_0.7fr] md:py-14 lg:px-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            Back to home
          </Link>
          <Badge variant="outline" className="mt-8 block w-fit bg-white/70">
            Shop by category
          </Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Browse our {category.name.toLowerCase()} collection, selected for
            useful everyday finds and easy gifting.
          </p>
          <p className="mt-5 text-sm font-medium text-muted-foreground">
            {productCount} {productCount === 1 ? "product" : "products"}
          </p>
        </div>

        {category.image ? (
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-white shadow-sm">
            <Image
              src={category.image.src}
              alt={category.image.alt || category.name}
              fill
              fetchPriority="high"
              sizes="(max-width: 767px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
