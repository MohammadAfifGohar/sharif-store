"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, MenuIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getCategoryPath,
  type CategoryNavigationItem,
} from "@/lib/category-navigation";

const MotionLink = motion.create(Link);

export type NavigationItem = {
  label: string;
  href: string;
  badge: string | null;
};

type MobileNavigationSheetProps = {
  items: readonly NavigationItem[];
  categories: CategoryNavigationItem[];
};

export function MobileNavigationSheet({
  items,
  categories,
}: MobileNavigationSheetProps) {
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-lg" className="size-11" />
        }
      >
        <MenuIcon />
        <span className="sr-only">Open navigation</span>
      </SheetTrigger>

      <SheetContent side="right" className="!w-full gap-0 p-0 sm:!max-w-sm">
        <SheetHeader className="border-b border-border/70 px-6 py-6">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
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
          <MotionLink
            href={items[0].href}
            initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            whileTap={shouldReduceMotion ? undefined : { x: 4 }}
            onClick={() => setOpen(false)}
            className="group flex items-center justify-between rounded-xl px-4 py-4 font-heading text-lg font-semibold transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-2.5">
              {items[0].label}
              <Badge className="h-4 px-1.5 text-[9px] font-bold uppercase tracking-[0.08em]">
                {items[0].badge}
              </Badge>
            </span>
            <ArrowRightIcon
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          </MotionLink>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: shouldReduceMotion ? 0 : 0.055,
              duration: 0.3,
              ease: "easeOut",
            }}
            className="px-4"
          >
            <Accordion>
              <AccordionItem value="shop-categories" className="border-0">
                <AccordionTrigger className="py-4 font-heading text-lg font-semibold no-underline hover:no-underline">
                  Shop categories
                </AccordionTrigger>
                <AccordionContent className="pb-4 [&_a]:!no-underline">
                  <Accordion multiple className="gap-1">
                    {categories.map((category) => (
                      <AccordionItem key={category.id} value={category.slug} className="border-0">
                        {category.children.length > 0 ? (
                          <>
                            <AccordionTrigger className="py-3 font-heading text-base no-underline hover:no-underline">
                              {category.name}
                            </AccordionTrigger>
                            <AccordionContent className="ml-3 flex flex-col gap-1 pb-3">
                              {category.children.map((subcategory) => (
                                <Link
                                  key={subcategory.id}
                                  href={getCategoryPath(subcategory.slug)}
                                  onClick={() => setOpen(false)}
                                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground !no-underline transition-colors hover:bg-background hover:text-foreground"
                                >
                                  {subcategory.name}
                                  <ArrowRightIcon
                                    aria-hidden="true"
                                    className="size-3.5 shrink-0 opacity-60"
                                  />
                                </Link>
                              ))}
                            </AccordionContent>
                          </>
                        ) : (
                          <Link
                            href={getCategoryPath(category.slug)}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between gap-3 py-3 font-heading text-base font-medium !no-underline"
                          >
                            {category.name}
                            <ArrowRightIcon
                              aria-hidden="true"
                              className="size-4 shrink-0 text-muted-foreground"
                            />
                          </Link>
                        )}
                      </AccordionItem>
                    ))}
                  </Accordion>
                  <Link
                    href="/#categories"
                    onClick={() => setOpen(false)}
                    className="mt-2 flex items-center gap-2 py-2 text-sm font-semibold text-primary"
                  >
                    Browse all categories
                    <ArrowRightIcon aria-hidden="true" className="size-4" />
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>

          {items.slice(1).map((item, index) => (
            <MotionLink
              key={item.href}
              href={item.href}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: shouldReduceMotion ? 0 : index * 0.055 + 0.11,
                duration: 0.3,
                ease: "easeOut",
              }}
              whileTap={shouldReduceMotion ? undefined : { x: 4 }}
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between rounded-xl px-4 py-4 font-heading text-lg font-semibold transition-colors hover:bg-muted"
            >
              <span className="flex items-center gap-2.5">
                {item.label}
                {item.badge ? (
                  <Badge className="h-4 px-1.5 text-[9px] font-bold uppercase tracking-[0.08em]">
                    {item.badge}
                  </Badge>
                ) : null}
              </span>
              <ArrowRightIcon
                aria-hidden="true"
                className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1"
              />
            </MotionLink>
          ))}
        </nav>

      </SheetContent>
    </Sheet>
  );
}
