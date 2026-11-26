"use client";

import { HeartIcon } from "lucide-react";

import { useWishlist } from "@/lib/wishlist-store";
import { cn } from "@/lib/utils";

/**
 * Heart that saves a product to the wishlist. "card" floats over a product
 * photo; "panel" sits next to the add-to-bag button on the product page.
 */
export function WishlistButton({
  productId,
  productName,
  categorySlug,
  variant = "card",
  className,
}: {
  productId: number;
  productName: string;
  categorySlug: string;
  variant?: "card" | "panel";
  className?: string;
}) {
  const wishlist = useWishlist();
  const saved = wishlist.has(productId);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      title={saved ? "Saved to wishlist" : "Save to wishlist"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        wishlist.toggle(productId, categorySlug);
      }}
      className={cn(
        "grid shrink-0 place-items-center transition-[color,background-color,transform] active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variant === "card"
          ? "size-9 rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur hover:text-primary"
          : "size-11 rounded-xl border border-border bg-background hover:border-primary/40 hover:text-primary",
        saved && "text-primary",
        className,
      )}
    >
      <HeartIcon className={cn("size-[18px]", saved && "fill-current")} strokeWidth={2} />
    </button>
  );
}
