import Image from "next/image";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { absoluteUrl, SITE_NAME } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-6 sm:py-8 md:grid-cols-[1.4fr_0.6fr_0.6fr] md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="relative -ml-4 h-14 w-40 sm:h-16 sm:w-44">
              <Image
                src="/sharif-store-logo-footer.png"
                alt={SITE_NAME}
                fill
                sizes="176px"
                className="object-contain object-left"
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
              <Link href="/new-arrivals">New arrivals</Link>
              <Link href="/#categories">Categories</Link>
              <Link href="/best-deals">Offers</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em]">
              Help
            </p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-background/65">
              <Link href="/contact">Contact</Link>
              <a href={absoluteUrl("/my-account/")}>My account</a>
              <a href={absoluteUrl("/terms-conditions/")}>Terms</a>
            </div>
          </div>
        </div>

        <Separator className="bg-background/15" />

        <div className="flex flex-col items-center justify-between gap-2 pt-6 text-center text-xs text-background/50 sm:flex-row sm:gap-3 sm:pt-7 sm:text-left">
          <p>© {new Date().getFullYear()} Sharif Beauty & Gift Collection</p>
          <p>Products and prices synced from WooCommerce.</p>
        </div>
      </div>
    </footer>
  );
}
