export default function NewArrivalsLoading() {
  return (
    <main aria-busy="true" aria-label="Loading new arrivals">
      <div className="mx-auto aspect-[768/1200] w-full max-w-[1800px] animate-pulse bg-muted sm:aspect-[2/1]" />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-3 gap-y-8 px-4 py-10 sm:gap-x-5 sm:px-6 sm:py-14 md:grid-cols-3 lg:grid-cols-4 lg:px-8">
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
    </main>
  );
}
