import { getImageProps } from "next/image";

export function NewArrivalsBanner() {
  const common = {
    alt: "Just landed. New arrivals. The latest beauty, gifting and everyday discoveries, gathered in one fresh edit.",
    sizes: "100vw",
    fetchPriority: "high" as const,
  };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...common,
    src: "/new-arrivals-desktop.avif",
    width: 1800,
    height: 900,
    quality: 85,
  });
  const {
    props: { srcSet: mobileSrcSet, ...mobileImageProps },
  } = getImageProps({
    ...common,
    src: "/new-arrivals-mobile.avif",
    width: 768,
    height: 1200,
    quality: 80,
  });

  return (
    <section aria-labelledby="new-arrivals-heading" className="bg-background">
      <h1 id="new-arrivals-heading" className="sr-only">
        New arrivals
      </h1>
      <picture className="mx-auto block w-full max-w-[1800px] overflow-hidden bg-muted">
        <source media="(min-width: 640px)" srcSet={desktopSrcSet} />
        <source srcSet={mobileSrcSet} />
        <img
          {...mobileImageProps}
          alt={common.alt}
          className="block h-auto w-full"
        />
      </picture>
    </section>
  );
}
