"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, MenuIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MotionLink = motion.create(Link);

export type NavigationItem = {
  label: string;
  href: string;
  badge: string | null;
};

type MobileNavigationSheetProps = {
  items: readonly NavigationItem[];
};

export function MobileNavigationSheet({
  items,
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
          {items.map((item, index) => (
            <MotionLink
              key={item.href}
              href={item.href}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: shouldReduceMotion ? 0 : index * 0.055 + 0.08,
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
