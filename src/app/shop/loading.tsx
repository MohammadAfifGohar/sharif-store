export default function ShopLoading() {
  return (
    <main aria-busy="true" aria-label="Loading all products">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-11 sm:px-6 lg:px-8">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-9 w-56 animate-pulse rounded bg-muted" />
        <div className="-mx-3 mt-8 grid grid-cols-2 gap-1 sm:mx-0 sm:gap-x-5 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-border"
            >
              <div className="aspect-[4/5] animate-pulse bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
