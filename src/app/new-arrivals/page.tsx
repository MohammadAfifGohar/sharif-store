import type { Metadata } from "next";

import { NewArrivalsBanner } from "./components/new-arrivals-banner";
import { NewArrivalsGrid } from "./components/new-arrivals-grid";
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
      <NewArrivalsBanner />
      <NewArrivalsGrid products={products} />
    </main>
  );
}
