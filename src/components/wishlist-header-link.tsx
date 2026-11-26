"use client";

import Link from "next/link";
import { HeartIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useWishlist } from "@/lib/wishlist-store";
import { cn } from "@/lib/utils";

export function WishlistHeaderLink() {
  const { count } = useWishlist();

  return (
    <Link
      href="/wishlist"
      aria-label={count ? `Wishlist, ${count} saved` : "Wishlist"}
      className={cn(buttonVariants({ variant: "ghost", size: "icon-lg" }), "relative size-11")}
    >
      <HeartIcon />
      {count > 0 ? (
        <Badge className="absolute right-0 top-0 h-4 min-w-4 justify-center px-0.5 text-[9px] leading-none">
          {count}
        </Badge>
      ) : null}
    </Link>
  );
}
