import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotFoundStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
};

export function NotFoundState({
  eyebrow,
  title,
  description,
  href = "/",
  linkLabel = "Return home",
}: NotFoundStateProps) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
        {description}
      </p>
      <Link href={href} className={cn(buttonVariants(), "mt-7")}>
        {linkLabel}
      </Link>
    </main>
  );
}
