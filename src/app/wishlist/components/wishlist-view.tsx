"use client";

import Link from "next/link";
import { HeartIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { loadWishlistProducts } from "@/app/actions/wishlist-products";
import { ProductCard } from "@/components/product-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductCardItem } from "@/lib/product-variants";
import { useWishlist } from "@/lib/wishlist-store";

const GRID_CLASS =
  "-mx-3 mt-6 grid grid-cols-2 items-stretch gap-1 sm:mx-0 sm:gap-x-5 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4";

type Loaded = { key: string; items: ProductCardItem[] | null };

export function WishlistView() {
  const wishlist = useWishlist();
  const { entries, ready, remove } = wishlist;
  const ids = entries.map((entry) => entry.productId);
  const key = [...ids].sort((a, b) => a - b).join(",");
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!ready || !key) return;
    let cancelled = false;
    void loadWishlistProducts(key.split(",").map(Number)).then((items) => {
      if (!cancelled) setLoaded({ key, items });
    });
    return () => {
      cancelled = true;
    };
  }, [ready, key, retry]);

  // Products that were taken off the store are dropped from the list, but only
  // after a successful load, never because the network failed.
  useEffect(() => {
    if (!loaded?.items || loaded.key !== key) return;
    const found = new Set(loaded.items.map((item) => item.product.id));
    const gone = key.split(",").map(Number).filter((id) => !found.has(id));
    if (gone.length) remove(gone);
  }, [loaded, key, remove]);

  const header = (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Saved for later</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Your wishlist</h1>
      </div>
      {ready && entries.length ? (
        <p className="text-sm text-muted-foreground">
          {entries.length} {entries.length === 1 ? "product" : "products"}
        </p>
      ) : null}
    </div>
  );

  if (ready && !entries.length) {
    return (
      <section className="pt-3">
        {header}
        <div className="mt-6 rounded-3xl border border-border bg-background px-6 py-16 text-center shadow-sm sm:py-20">
          <HeartIcon className="mx-auto size-10 text-primary" />
          <h2 className="mt-4 font-heading text-2xl font-semibold">Nothing saved yet</h2>
          <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
            Tap the heart on any product to save it here, and come back to it whenever you like.
          </p>
          <Link href="/shop" className={`${buttonVariants({ size: "lg" })} mt-7`}>
            Browse products
          </Link>
        </div>
      </section>
    );
  }

  const current = loaded?.key === key ? loaded.items : undefined;
  const byId = new Map((current ?? []).map((item) => [item.product.id, item]));
  // Newest saved first, in the order the shopper saved them.
  const items = entries.map((entry) => ({ entry, item: byId.get(entry.productId) })).filter((x) => x.item);

  return (
    <section className="pt-3">
      {header}
      {current === null ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Your saved products could not be loaded right now.</p>
          <Button variant="outline" onClick={() => setRetry((n) => n + 1)}>
            Try again
          </Button>
        </div>
      ) : current === undefined ? (
        <div className={GRID_CLASS} aria-busy="true">
          {Array.from({ length: Math.min(Math.max(entries.length, 2), 8) }).map((_, index) => (
            <div key={index} className="flex min-w-0 flex-col gap-3 px-1" aria-hidden="true">
              <Skeleton className="aspect-[4/5] w-full rounded-xl" />
              <Skeleton className="h-4 w-4/5 rounded-sm" />
              <Skeleton className="h-8 w-full rounded-sm" />
            </div>
          ))}
          <span className="sr-only">Loading your wishlist…</span>
        </div>
      ) : (
        <div className={GRID_CLASS}>
          {items.map(({ entry, item }) => (
            <ProductCard
              key={entry.productId}
              product={item!.product}
              categorySlug={entry.categorySlug || item!.product.categories[0]?.slug || ""}
              variants={item!.variants}
            />
          ))}
        </div>
      )}
    </section>
  );
}
