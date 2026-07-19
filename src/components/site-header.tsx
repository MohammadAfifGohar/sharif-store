"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRightIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  ShoppingBagIcon,
  UserRoundIcon,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "New arrivals", href: "#new-arrivals" },
  { label: "Shop categories", href: "#categories" },
  { label: "Best deals", href: "#deals" },
  { label: "Our promise", href: "#our-promise" },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

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

          <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
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

          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <a
              href="https://thesharifstore.in/cart-2/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-lg" }),
                "size-11",
              )}
              aria-label="Open shopping cart"
            >
              <ShoppingBagIcon />
            </a>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="size-11"
                  />
                }
              >
                <MenuIcon />
                <span className="sr-only">Open navigation</span>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="!w-full gap-0 p-0 sm:!max-w-sm"
              >
                <SheetHeader className="border-b border-border/70 px-6 py-6">
                  <motion.div
                    initial={
                      shouldReduceMotion ? false : { opacity: 0, x: 18 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    <div className="relative mb-5 h-11 w-32">
                      <Image
                        src="/logo.webp"
                        alt=""
                        fill
                        sizes="128px"
                        className="object-contain object-left"
                      />
                    </div>
                  </motion.div>
                  <SheetTitle className="font-heading text-2xl font-semibold">
                    Browse the store
                  </SheetTitle>
                  <SheetDescription>
                    Beauty, gifting and useful little finds.
                  </SheetDescription>
                </SheetHeader>

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
                  {navItems.map((item, index) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      initial={
                        shouldReduceMotion ? false : { opacity: 0, x: 24 }
                      }
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : index * 0.055 + 0.08,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      whileTap={shouldReduceMotion ? undefined : { x: 4 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center justify-between rounded-xl px-4 py-4 font-heading text-lg font-semibold transition-colors hover:bg-muted"
                    >
                      {item.label}
                      <ArrowRightIcon
                        aria-hidden="true"
                        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1"
                      />
                    </motion.a>
                  ))}
                </nav>

                <SheetFooter className="border-t border-border/70 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
                  <motion.a
                    href="https://thesharifstore.in/cart-2/"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "w-full justify-between",
                    )}
                    initial={
                      shouldReduceMotion ? false : { opacity: 0, y: 12 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: shouldReduceMotion ? 0 : 0.26,
                      duration: 0.3,
                    }}
                  >
                    View shopping cart
                    <ShoppingBagIcon data-icon="inline-end" />
                  </motion.a>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          <div className="ml-auto hidden items-center gap-1 lg:flex">
            <Button variant="ghost" size="icon" aria-label="Search">
              <SearchIcon />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Wishlist">
              <HeartIcon />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Account">
              <UserRoundIcon />
            </Button>
            <a
              href="https://thesharifstore.in/cart-2/"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
              aria-label="Open shopping cart"
            >
              <ShoppingBagIcon />
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
