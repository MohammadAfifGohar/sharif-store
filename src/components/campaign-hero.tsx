import Image, { getImageProps } from "next/image";

type CampaignImage = {
  height: number;
  src: string;
  width: number;
};

type CampaignHeroProps = {
  alt: string;
  desktopImage: CampaignImage;
  href: string;
  mobileImage?: CampaignImage;
};

export function CampaignHero({
  alt,
  desktopImage,
  href,
  mobileImage,
}: CampaignHeroProps) {
  if (!mobileImage) {
    return (
      <section aria-label="Featured promotion" className="bg-background">
        <a href={href} className="block overflow-hidden">
          <Image
            {...desktopImage}
            alt={alt}
            priority
            quality={85}
            sizes="100vw"
            className="h-auto w-full"
          />
        </a>
      </section>
    );
  }

  const common = {
    alt,
    fetchPriority: "high" as const,
    quality: 85,
    sizes: "100vw",
  };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, ...desktopImage });
  const {
    props: { srcSet: mobileSrcSet, ...mobileProps },
  } = getImageProps({ ...common, ...mobileImage });

  return (
    <section aria-label="Featured promotion" className="bg-background">
      <a href={href} className="block overflow-hidden">
        <picture>
          <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
          <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
          <img {...mobileProps} alt={alt} className="h-auto w-full" />
        </picture>
      </a>
    </section>
  );
}
