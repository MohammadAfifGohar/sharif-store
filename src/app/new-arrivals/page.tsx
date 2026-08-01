import type { Metadata } from "next";

import { NewArrivalsBanner } from "./components/new-arrivals-banner";
import { NewArrivalsGrid } from "./components/new-arrivals-grid";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getNewArrivalProducts } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "New Arrivals",
  description:
    "Explore the newest beauty, gifting and everyday products at The Shareef Store.",
  alternates: {
    canonical: "/new-arrivals",
  },
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivalProducts();

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "New arrivals" }]} />
      </div>
      <NewArrivalsBanner />
      <NewArrivalsGrid products={products} />
    </main>
  );
}
