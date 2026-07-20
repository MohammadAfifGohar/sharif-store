import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CategoryNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Collection unavailable
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        We couldn&apos;t find that category
      </h1>
      <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
        It may have been renamed or removed. Return home to browse the
        collections currently available.
      </p>
      <Link href="/" className={cn(buttonVariants(), "mt-7")}>
        Return home
      </Link>
    </main>
  );
}
