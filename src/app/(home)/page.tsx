import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { CampaignHero } from "./components/campaign-hero";
import { CategoryCarousel } from "./components/category-carousel";
import { CategoryItem } from "./components/category-item";
import { FeaturePanelImage } from "./components/feature-panel-image";
import { Reveal } from "./components/reveal";
import { heroSlides, promises } from "./utils/home-content";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { expandProductsForGrid } from "@/lib/product-variants";
import { getHomepageCommerceData } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const { products, categories } = await getHomepageCommerceData();
  const categorizedProducts = products.filter(
    (product) => product.categories.length > 0,
  );
  const trendingItems = await expandProductsForGrid(categorizedProducts);

  return (
      <main className="flex-1">
        <h1 className="sr-only">
          Beauty, gifts and everyday essentials at Sharif Store
        </h1>
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

        {trendingItems.length > 0 ? (
          <section
            id="trending"
            className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16"
          >
            <div className="mb-7 flex items-end justify-between gap-5 sm:mb-9">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Just landed
                </p>
                <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  Shop our latest picks
                </h2>
              </div>
              <Link
                href="/new-arrivals"
                className="shrink-0 text-sm font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="-mx-3 grid grid-cols-2 gap-1 sm:mx-0 sm:gap-x-5 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {trendingItems.map((item) => (
                <ProductCard
                  key={item.product.id}
                  product={item.product}
                  categorySlug={item.product.categories[0].slug}
                  variants={item.variants}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section
          id="deals"
          className="border-y border-[#e5e7eb] bg-primary text-primary-foreground"
        >
          <div className="grid w-full lg:grid-cols-2">
            <Reveal className="flex flex-col justify-between gap-12 px-6 py-12 sm:min-h-[520px] sm:gap-0 sm:p-12 lg:p-16">
              <div className="flex items-center justify-between gap-6">
                <Badge variant="secondary">Skincare spotlight</Badge>
              </div>
              <div>
                <p className="mb-5 max-w-md text-sm leading-6 text-primary-foreground/65">
                  A gentle everyday cleanser for a fresh, comfortable start to
                  your routine.
                </p>
                <h2 className="max-w-xl font-heading text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                  Fresh skin starts with one simple step.
                </h2>
                <Link
                  href="/category/face-wash/mama-earth-face-wash"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "lg" }),
                    "mt-8 w-full sm:mt-9 sm:w-auto",
                  )}
                >
                  Shop face wash
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </div>
            </Reveal>

            <FeaturePanelImage
              src="/homepage-face-wash-panel.avif"
              alt="Mamaearth Rice Dewy Bright Face Wash"
            />
          </div>
        </section>

        <section
          id="new-finds"
          className="border-b border-[#e5e7eb] bg-secondary text-secondary-foreground"
        >
          <div className="grid w-full lg:grid-cols-2">
            <FeaturePanelImage
              src="/homepage-teddy.avif"
              alt="Caramel teddy bear with a rose ribbon"
              className="order-2 bg-muted lg:order-1"
            />

            <Reveal className="order-1 flex flex-col justify-between gap-12 px-6 py-12 sm:min-h-[520px] sm:p-12 lg:order-2 lg:p-16">
              <Badge
                variant="outline"
                className="w-fit border-primary/25 bg-primary/10 text-primary"
              >
                Gift-ready favourite
              </Badge>
              <div>
                <p className="mb-5 max-w-md text-sm leading-6 text-muted-foreground">
                  A soft, timeless surprise for birthdays, celebrations and
                  just-because moments.
                </p>
                <h2 className="max-w-xl font-heading text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                  A little comfort, wrapped with care.
                </h2>
                <Link
                  href="/category/toys"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "mt-8 w-full sm:mt-9 sm:w-auto",
                  )}
                >
                  Explore gifts
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

