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
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
      className="group flex min-w-[116px] shrink-0 snap-start flex-col gap-2.5 sm:min-w-[128px]"
    >
      <span className="relative block aspect-square overflow-hidden rounded-xl bg-secondary">
        {category.image ? (
          <Image
            src={category.image.src}
            alt={category.image.alt || categoryName}
            fill
            sizes="(max-width: 640px) 116px, 128px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full place-items-center bg-gradient-to-br from-secondary to-muted font-heading text-4xl font-semibold text-primary">
            {categoryName.charAt(0)}
          </span>
        )}
      </span>
      <span className="px-1 text-center">
        <span className="block font-heading text-sm font-semibold leading-5">
          {categoryName}
        </span>
        <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
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
    <>
      <SiteHeader />

      <main>
        <CampaignHero
          alt="Nykaa Fashion Hot Pink Sale, up to 80% off"
          desktopImage={{
            src: "/campaign-banner.avif",
            width: 1800,
            height: 398,
          }}
          href="#categories"
        />

        <section id="categories" className="border-y border-border bg-background">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10">
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

        <section
          id="new-arrivals"
          className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32"
        >
          <Reveal className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Latest collection
              </p>
              <h2 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-6xl">
                Just landed, already loved.
              </h2>
            </div>
            <a
              href="https://thesharifstore.in/shop-2/"
              className={buttonVariants({ variant: "outline" })}
            >
              View the full shop
              <ArrowRightIcon data-icon="inline-end" />
            </a>
          </Reveal>

          {currentProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
              {currentProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border p-12 text-center text-muted-foreground">
              The store catalogue is temporarily unavailable. Please try again
              shortly.
            </div>
          )}
        </section>

        <section id="deals" className="bg-primary text-primary-foreground">
          <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
            <Reveal className="flex min-h-[520px] flex-col justify-between p-8 sm:p-12 lg:p-16">
              <div className="flex items-center justify-between gap-6">
                <Badge variant="secondary">The value edit</Badge>
                <BadgeIndianRupeeIcon className="size-8 opacity-60" />
              </div>
              <div>
                <p className="mb-5 max-w-md text-sm leading-6 text-primary-foreground/65">
                  Everyday favourites, lighter prices. Explore skincare,
                  fragrance and personal-care picks currently on offer.
                </p>
                <h2 className="max-w-xl font-heading text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
                  Good things shouldn&apos;t feel out of reach.
                </h2>
                <a
                  href="https://thesharifstore.in/shop-2/?on_sale=1"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "lg" }),
                    "mt-9",
                  )}
                >
                  Shop live offers
                  <ArrowRightIcon data-icon="inline-end" />
                </a>
              </div>
            </Reveal>

            <div className="relative min-h-[520px] overflow-hidden bg-secondary">
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
              <div className="absolute left-7 top-7 rounded-full bg-background p-5 text-center text-foreground shadow-xl">
                <span className="block font-heading text-3xl font-semibold">
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
          className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32"
        >
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Why Sharif
            </p>
            <h2 className="mt-3 font-heading text-4xl font-semibold sm:text-6xl">
              A neighbourhood-store kind of experience.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {promises.map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal key={item.title} delay={index * 0.08}>
                  <div className="flex flex-col items-center text-center">
                    <span className="grid size-16 place-items-center rounded-full bg-secondary">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-6 font-heading text-2xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                      {item.copy}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
          <div className="grid gap-12 py-8 md:grid-cols-[1.4fr_0.6fr_0.6fr]">
            <div>
              <div className="relative h-16 w-44">
                <Image
                  src="/logo.webp"
                  alt="The Shareef Store"
                  fill
                  sizes="176px"
                  className="object-contain object-left invert"
                />
              </div>
              <p className="mt-4 max-w-md text-sm leading-6 text-background/60">
                Beauty, gifts and useful everyday discoveries—all in one
                thoughtfully arranged place.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em]">
                Explore
              </p>
              <div className="mt-5 flex flex-col gap-3 text-sm text-background/65">
                <a href="#new-arrivals">New arrivals</a>
                <a href="#categories">Categories</a>
                <a href="#deals">Offers</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em]">
                Help
              </p>
              <div className="mt-5 flex flex-col gap-3 text-sm text-background/65">
                <a href="https://thesharifstore.in/contact/">Contact</a>
                <a href="https://thesharifstore.in/my-account/">My account</a>
                <a href="https://thesharifstore.in/terms-conditions/">
                  Terms
                </a>
              </div>
            </div>
          </div>
          <Separator className="bg-background/15" />
          <div className="flex flex-col justify-between gap-3 pt-7 text-xs text-background/50 sm:flex-row">
            <p>© 2026 Sharif Beauty & Gift Collection</p>
            <p>Products and prices synced from WooCommerce.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
