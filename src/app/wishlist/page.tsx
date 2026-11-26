import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { WishlistView } from "./components/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products you saved at The Sharif Store.",
  robots: { index: false, follow: false },
};

/** The list lives in the shopper's browser, so the page itself is static. */
export default function WishlistPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
      <div className="py-4">
        <Breadcrumbs items={[{ label: "Wishlist" }]} />
      </div>
      <WishlistView />
    </main>
  );
}
