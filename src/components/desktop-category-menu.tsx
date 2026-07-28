"use client";

 import { useState } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  getCategoryPath,
  type CategoryNavigationItem,
} from "@/lib/category-navigation";
import { cn } from "@/lib/utils";

type DesktopCategoryMenuProps = {
  categories: CategoryNavigationItem[];
};

export function DesktopCategoryMenu({
  categories,
}: DesktopCategoryMenuProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    () =>
      categories.find((category) => category.children.length > 0)?.id ?? null,
  );
  const activeCategory = categories.find(
    (category) => category.id === activeCategoryId,
  );

  if (categories.length === 0) {
    return (
      <Link
        href="/#categories"
        className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        Shop categories
      </Link>
    );
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent px-0 font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground data-popup-open:bg-transparent">
            Shop categories
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-0">
            <div className="grid h-[min(68vh,460px)] w-[min(92vw,860px)] grid-cols-[minmax(240px,0.8fr)_minmax(0,1.5fr)] overflow-hidden">
              <ul className="flex flex-col gap-1 overflow-y-auto border-r border-border bg-background p-3">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="min-w-0"
                    onMouseEnter={() =>
                      category.children.length > 0
                        ? setActiveCategoryId(category.id)
                        : undefined
                    }
                    onFocusCapture={() =>
                      category.children.length > 0
                        ? setActiveCategoryId(category.id)
                        : undefined
                    }
                  >
                    <NavigationMenuLink
                      render={<Link href={getCategoryPath(category.slug)} />}
                      className={cn(
                        "justify-between px-3 py-3 font-heading font-semibold text-foreground",
                        activeCategoryId === category.id &&
                          "bg-secondary text-secondary-foreground",
                      )}
                    >
                      <span className="truncate">{category.name}</span>
                      {category.children.length > 0 ? (
                        <ChevronRightIcon aria-hidden="true" />
                      ) : null}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>

              <section className="overflow-y-auto bg-muted/35 p-6">
                {activeCategory && activeCategory.children.length > 0 ? (
                  <>
                    <p className="font-heading text-xl font-semibold">
                    {activeCategory.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose a subcategory
                    </p>
                    <ul className="mt-5 grid grid-cols-2 gap-2">
                    {activeCategory.children.map((subcategory) => (
                      <li key={subcategory.id}>
                          <NavigationMenuLink
                            render={
                              <Link
                                href={getCategoryPath(subcategory.slug)}
                              />
                            }
                            className="min-h-12 rounded-lg border border-border bg-background px-3 py-2.5 font-medium text-foreground shadow-xs hover:border-primary/30 hover:bg-secondary"
                        >
                          {subcategory.name}
                          </NavigationMenuLink>
                      </li>
                    ))}
                    </ul>
                  </>
                ) : (
                  <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
                    Categories with subcategories will appear here.
                  </div>
                )}
              </section>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
