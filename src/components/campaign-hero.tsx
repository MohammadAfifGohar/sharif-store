import { getImageProps } from "next/image";

type CampaignImage = {
  height: number;
  src: string;
  width: number;
};

type CampaignHeroProps = {
  alt: string;
  desktopImage: CampaignImage;
  href: string;
  mobileImage: CampaignImage;
};

export function CampaignHero({
  alt,
  desktopImage,
  href,
  mobileImage,
}: CampaignHeroProps) {
  const common = {
    alt,
    fetchPriority: "high" as const,
    quality: 85,
    sizes: "100vw",
  };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, ...desktopImage });
  const { props: mobileProps } = getImageProps({
    ...common,
    ...mobileImage,
  });

  return (
    <section aria-label="Featured promotion">
      <a href={href} className="block overflow-hidden">
        <picture className="block">
          <source
            media="(min-width: 768px)"
            srcSet={desktopSrcSet}
            width={desktopImage.width}
            height={desktopImage.height}
          />
          <img {...mobileProps} alt={alt} className="block h-auto w-full" />
        </picture>
      </a>
    </section>
  );
}
