import Image from "next/image";
import Link from "next/link";

import {
  MobileNavigationSheet,
  type NavigationItem,
} from "@/components/mobile-navigation-sheet";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "New arrivals", href: "#new-arrivals", badge: "New" },
  { label: "Shop categories", href: "#categories", badge: null },
  { label: "Best deals", href: "#deals", badge: null },
  { label: "Our promise", href: "#our-promise", badge: null },
] satisfies readonly NavigationItem[];

export function SiteHeader() {
  return (
    <>
      <div className="bg-primary px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-primary-foreground sm:text-xs sm:tracking-[0.18em]">
        Summer edit &middot; Up to 40% off selected finds
      </div>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:h-18 sm:px-6 lg:gap-8 lg:px-10">
          <Link
            href="/"
            className="relative h-10 w-28 shrink-0 sm:h-12 sm:w-40"
            aria-label="Sharif Store home"
          >
            <Image
              src="/logo.webp"
              alt="The Shareef Store"
              fill
              priority
              sizes="(max-width: 640px) 112px, 160px"
              className="object-contain object-left"
            />
          </Link>

          <nav className="ml-auto hidden items-center justify-end gap-7 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
                {item.badge ? (
                  <Badge className="h-4 px-1.5 text-[9px] font-bold uppercase tracking-[0.08em]">
                    {item.badge}
                  </Badge>
                ) : null}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center lg:hidden">
            <MobileNavigationSheet items={navItems} />
          </div>
        </div>
      </header>
    </>
  );
}
