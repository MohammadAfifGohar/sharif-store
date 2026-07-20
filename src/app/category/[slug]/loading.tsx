import Image from "next/image";

export default function CategoryLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading category"
      className="relative grid min-h-[60svh] flex-1 place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(248,196,204,0.55),transparent_58%)] px-6 py-16"
    >
      <div className="relative flex flex-col items-center text-center">
        <div className="relative grid size-44 place-items-center sm:size-52">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-primary/15 motion-safe:animate-ping"
          />
          <span
            aria-hidden="true"
            className="absolute inset-9 rounded-full bg-[#f8c4cc]/55 shadow-[0_18px_60px_rgba(124,35,58,0.14)] motion-safe:animate-pulse"
          />
          <Image
            src="/logo.webp"
            alt=""
            width={150}
            height={82}
            fetchPriority="high"
            sizes="150px"
            className="relative h-auto w-[130px] sm:w-[150px]"
          />
        </div>
        <p className="mt-5 font-heading text-xl font-semibold tracking-tight">
          Preparing this collection
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your selected products are on the way.
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        Loading category products…
      </p>
    </main>
  );
}
