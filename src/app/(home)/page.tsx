import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { CampaignHero } from "./components/campaign-hero";
import { CategoryCarousel } from "./components/category-carousel";
import { CategoryItem } from "./components/category-item";
import { Reveal } from "./components/reveal";
import { heroSlides, promises } from "./utils/home-content";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getHomepageCommerceData } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const { products, categories, featuredDiscoveryProduct } =
    await getHomepageCommerceData();
  const offerFeatureProduct =
    products.find(
      (product) =>
        product.id > 1000 &&
        product.on_sale &&
        product.images[0] &&
        product.id !== featuredDiscoveryProduct?.id,
    ) ??
    products.find(
      (product) =>
        product.images[0] && product.id !== featuredDiscoveryProduct?.id,
    );

  return (
      <main className="flex-1">
        <CampaignHero slides={heroSlides} />

        <section id="categories" className="border-y border-border bg-background">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
            <CategoryCarousel
              eyebrow="Find your aisle"
              itemCount={categories.length}
              title="Shop by category"
            >
              {categories.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))}
            </CategoryCarousel>
          </div>
        </section>

        <section id="deals" className="bg-primary text-primary-foreground">
          <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
            <Reveal className="flex flex-col justify-between gap-12 px-6 py-12 sm:min-h-[520px] sm:gap-0 sm:p-12 lg:p-16">
              <div className="flex items-center justify-between gap-6">
                <Badge variant="secondary">The value edit</Badge>
              </div>
              <div>
                <p className="mb-5 max-w-md text-sm leading-6 text-primary-foreground/65">
                  Everyday favourites, lighter prices. Explore skincare,
                  fragrance and personal-care picks currently on offer.
                </p>
                <h2 className="max-w-xl font-heading text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                  Good things shouldn&apos;t feel out of reach.
                </h2>
                <a
                  href="https://thesharifstore.in/shop-2/?on_sale=1"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "lg" }),
                    "mt-8 w-full sm:mt-9 sm:w-auto",
                  )}
                >
                  Shop live offers
                  <ArrowRightIcon data-icon="inline-end" />
                </a>
              </div>
            </Reveal>

            <div className="relative aspect-[4/3] overflow-hidden bg-secondary sm:aspect-auto sm:min-h-[520px]">
              {offerFeatureProduct?.images[0] ? (
                <Image
                  src={offerFeatureProduct.images[0].src}
                  alt={
                    offerFeatureProduct.images[0].alt ||
                    offerFeatureProduct.name
                  }
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : null}
            </div>
          </div>
        </section>

        <section
          id="new-finds"
          className="border-b border-border bg-secondary text-secondary-foreground"
        >
          <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
            <div className="relative order-2 aspect-[4/3] overflow-hidden bg-muted sm:aspect-auto sm:min-h-[520px] lg:order-1">
              {featuredDiscoveryProduct?.images[0] ? (
                <Image
                  src={featuredDiscoveryProduct.images[0].src}
                  alt={
                    featuredDiscoveryProduct.images[0].alt ||
                    featuredDiscoveryProduct.name
                  }
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
              ) : null}
            </div>

            <Reveal className="order-1 flex flex-col justify-between gap-12 px-6 py-12 sm:min-h-[520px] sm:p-12 lg:order-2 lg:p-16">
              <Badge
                variant="outline"
                className="w-fit border-primary/25 bg-primary/10 text-primary"
              >
                Freshly picked
              </Badge>
              <div>
                <p className="mb-5 max-w-md text-sm leading-6 text-muted-foreground">
                  New beauty, gifting and everyday-use discoveries selected to
                  make browsing feel a little more rewarding.
                </p>
                <h2 className="max-w-xl font-heading text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                  Small finds. Everyday delight.
                </h2>
                <Link
                  href="/new-arrivals"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "mt-8 w-full sm:mt-9 sm:w-auto",
                  )}
                >
                  Explore new finds
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="our-promise"
          className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-32"
        >
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Why Sharif
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-5xl lg:text-6xl">
              A neighbourhood-store kind of experience.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-8 sm:mt-16 sm:gap-10 md:grid-cols-3">
            {promises.map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal key={item.title} delay={index * 0.08}>
                  <div className="flex items-start gap-4 text-left sm:flex-col sm:items-center sm:gap-0 sm:text-center">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary sm:size-16">
                      <Icon className="size-5 sm:size-6" />
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-semibold sm:mt-6 sm:text-2xl">
                        {item.title}
                      </h3>
                      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground sm:mt-3">
                        {item.copy}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      </main>
  );
}
