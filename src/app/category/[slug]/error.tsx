"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertCircleIcon, RotateCcwIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Category page failed to load", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[45vh] max-w-7xl items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-xl border border-border bg-background p-7 text-center shadow-sm">
        <AlertCircleIcon
          aria-hidden="true"
          className="mx-auto text-destructive"
        />
        <h1 className="mt-4 font-heading text-2xl font-semibold">
          We couldn’t load these products
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The store service may be temporarily unavailable. Try again in a
          moment or return to the homepage.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button type="button" onClick={reset}>
            <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
            Try again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Go to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
