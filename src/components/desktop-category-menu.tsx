import Link from "next/link";

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

type DesktopCategoryMenuProps = {
  categories: CategoryNavigationItem[];
};

export function DesktopCategoryMenu({
  categories,
}: DesktopCategoryMenuProps) {
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
            <div className="w-[min(92vw,900px)] overflow-hidden rounded-lg bg-background p-5">
              <ul className="max-h-[min(70vh,520px)] columns-4 overflow-y-auto [column-gap:1.5rem]">
                {categories.map((category) => (
                  <li key={category.id} className="break-inside-avoid">
                    <NavigationMenuLink
                      render={<Link href={getCategoryPath(category.slug)} />}
                      className="block rounded-md px-3 py-2.5 font-heading text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                    >
                      {category.name}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
