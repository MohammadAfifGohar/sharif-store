import Image from "next/image";

export function BestDealsBanner() {
  return (
    <section aria-labelledby="best-deals-heading" className="bg-background">
      <h1 id="best-deals-heading" className="sr-only">
        Best deals
      </h1>
      <Image
        src="/best-deals-banner.avif"
        alt="Best Deals. Limited-time prices on beauty, gifts and everyday finds."
        width={1774}
        height={887}
        fetchPriority="high"
        sizes="100vw"
        className="mx-auto block h-auto w-full max-w-[1800px]"
      />
    </section>
  );
}
