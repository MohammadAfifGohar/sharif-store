function Skeleton({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-muted ${className}`}
    />
  );
}

export default function ProductLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading product"
      className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16"
    >
      <Skeleton className="mb-6 h-5 w-36" />

      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />

        <section className="flex min-w-0 flex-col lg:sticky lg:top-28">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-12 w-4/5 sm:h-14" />
          <Skeleton className="mt-5 h-7 w-28" />
          <div className="mt-7 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="mt-7 h-5 w-24" />
          <Skeleton className="mt-8 h-11 w-full sm:w-44" />
        </section>
      </div>

      <section className="mt-16 border-t border-border pt-10">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-6 h-28 w-full rounded-2xl" />
      </section>

      <p className="sr-only" aria-live="polite">
        Loading product details…
      </p>
    </main>
  );
}
