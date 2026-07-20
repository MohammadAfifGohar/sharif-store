import Image from "next/image";
import {
  ArrowRightIcon,
  BadgeIndianRupeeIcon,
  HeartHandshakeIcon,
  PackageCheckIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { CampaignHero } from "@/components/campaign-hero";
import { CategoryCarousel } from "@/components/category-carousel";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  getHomepageCommerceData,
  type WooCategory,
} from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

const promises = [
  {
    icon: PackageCheckIcon,
    title: "Carefully packed",
    copy: "Every order is checked and packed with care before it leaves us.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Genuine finds",
    copy: "Straightforward prices and a catalogue chosen for everyday use.",
  },
  {
    icon: HeartHandshakeIcon,
    title: "Human support",
    copy: "Questions before ordering? Speak to a real person from our store.",
  },
];

function CategoryItem({ category }: { category: WooCategory }) {
  const categoryName = category.name.replaceAll("&amp;", "&");

  return (
    <a
      href={category.permalink}
      className="group flex w-20 shrink-0 snap-start flex-col gap-1.5 sm:w-32 sm:gap-2.5"
    >
      <span className="relative block size-20 shrink-0 overflow-hidden rounded-lg bg-secondary sm:size-32 sm:rounded-xl">
        {category.image ? (
          <Image
            src={category.image.src}
            alt={category.image.alt || categoryName}
            fill
            sizes="(max-width: 639px) 80px, 128px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full place-items-center bg-gradient-to-br from-secondary to-muted font-heading text-4xl font-semibold text-primary">
            {categoryName.charAt(0)}
          </span>
        )}
      </span>
      <span className="px-1 text-center">
        <span className="line-clamp-2 min-h-8 font-heading text-xs font-semibold leading-4 sm:min-h-10 sm:text-sm sm:leading-5">
          {categoryName}
        </span>
        <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground sm:mt-1 sm:text-[10px] sm:tracking-[0.12em]">
          {category.count} {category.count === 1 ? "find" : "finds"}
        </span>
      </span>
    </a>
  );
}

export default async function Home() {
  const { products, categories } = await getHomepageCommerceData();
  const currentProducts = products
    .filter((product) => product.id > 1000)
    .slice(0, 5);

  return (
      <main className="flex-1">
        <CampaignHero
          alt="Women's handbags under ₹500"
          desktopImage={{
            src: "/handbags-under-500-desktop.avif",
            width: 1800,
            height: 900,
          }}
          mobileImage={{
            src: "/handbags-under-500-mobile.avif",
            width: 768,
            height: 1200,
          }}
          href="https://thesharifstore.in/product-category/bags-fashion/"
        />

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
                <BadgeIndianRupeeIcon className="size-8 opacity-60" />
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
              {currentProducts[2]?.images[0] ? (
                <Image
                  src={currentProducts[2].images[0].src}
                  alt={
                    currentProducts[2].images[0].alt ||
                    currentProducts[2].name
                  }
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : null}
              <div className="absolute left-4 top-4 rounded-full bg-background p-4 text-center text-foreground shadow-xl sm:left-7 sm:top-7 sm:p-5">
                <span className="block font-heading text-2xl font-semibold sm:text-3xl">
                  40%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Selected
                </span>
              </div>
            </div>
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
