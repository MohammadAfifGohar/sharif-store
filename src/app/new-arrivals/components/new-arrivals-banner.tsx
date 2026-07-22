import Image from "next/image";

export function NewArrivalsBanner() {
  return (
    <section aria-labelledby="new-arrivals-heading" className="bg-background">
      <h1 id="new-arrivals-heading" className="sr-only">
        New arrivals
      </h1>
      <Image
        src="/new-arrivals-desktop.avif"
        alt="Just landed. New arrivals. The latest beauty, gifting and everyday discoveries, gathered in one fresh edit."
        width={1800}
        height={900}
        priority
        sizes="100vw"
        className="mx-auto block h-auto w-full max-w-[1800px]"
      />
    </section>
  );
}
