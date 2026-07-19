"use client";

import Image from "next/image";
import Link from "next/link";
import {
  HeartIcon,
  MenuIcon,
  SearchIcon,
  ShoppingBagIcon,
  UserRoundIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "New arrivals", href: "#new-arrivals" },
  { label: "Shop categories", href: "#categories" },
  { label: "Best deals", href: "#deals" },
  { label: "Our promise", href: "#our-promise" },
];

export function SiteHeader() {
  return (
    <>
      <div className="bg-primary px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground">
        Summer edit · Up to 40% off selected finds
      </div>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" />}
              >
                <MenuIcon />
                <span className="sr-only">Open navigation</span>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Sharif Store</SheetTitle>
                  <SheetDescription>
                    Beauty, gifting and useful little finds.
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <Link
            href="/"
            className="relative h-11 w-36 shrink-0 sm:h-12 sm:w-40"
            aria-label="Sharif Store home"
          >
            <Image
              src="/logo.webp"
              alt="The Shareef Store"
              fill
              priority
              sizes="160px"
              className="object-contain object-left"
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Search">
              <SearchIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              aria-label="Wishlist"
            >
              <HeartIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              aria-label="Account"
            >
              <UserRoundIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Shopping bag"
              onClick={() => {
                window.location.href = "https://thesharifstore.in/cart-2/";
              }}
            >
              <ShoppingBagIcon />
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
