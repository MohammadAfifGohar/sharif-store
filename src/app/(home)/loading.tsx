import Image from "next/image";

export default function HomeLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading Sharif Store"
      className="relative grid min-h-[60svh] flex-1 place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(248,196,204,0.55),transparent_58%)] px-6 py-16"
    >
      <div className="relative flex flex-col items-center text-center ">
        <div className="relative grid size-44 place-items-center sm:size-52">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-primary/15 motion-safe:animate-ping"
          />
          <span
            aria-hidden="true"
            className="absolute inset-5 rounded-full border border-primary/25"
          />
          <span
            aria-hidden="true"
            className="absolute inset-9 rounded-full bg-[#f8c4cc]/55 shadow-[0_18px_60px_rgba(124,35,58,0.14)] motion-safe:animate-pulse"
          />
          <Image
            src="/sharif-store-logo-transparent.png"
            alt=""
            width={150}
            height={82}
            fetchPriority="high"
            sizes="150px"
            className="relative h-auto w-[130px] sm:w-[150px]"
          />
        </div>

        <p className="mt-5 font-heading text-xl font-semibold tracking-tight">
          Preparing your finds
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Beauty, gifts and everyday favourites are on the way.
        </p>

        <div
          aria-hidden="true"
          className="mt-6 flex items-center justify-center gap-2"
        >
          <span className="size-1.5 rounded-full bg-primary motion-safe:animate-bounce" />
          <span className="size-1.5 rounded-full bg-primary [animation-delay:150ms] motion-safe:animate-bounce" />
          <span className="size-1.5 rounded-full bg-primary [animation-delay:300ms] motion-safe:animate-bounce" />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Loading products and categories…
      </p>
    </main>
  );
}
