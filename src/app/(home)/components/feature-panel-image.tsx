import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Homepage split-feature images use an 18:13 source asset contract.
 * Source files should be prepared at 1440x1040 so object-cover never creates
 * letterboxing or unpredictable product cropping. On desktop the panel
 * stretches with its grid row so a taller copy column cannot expose a gap.
 */
export function FeaturePanelImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[18/13] w-full overflow-hidden bg-white lg:h-full lg:min-h-[520px] lg:aspect-auto",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        draggable={false}
        className="select-none object-cover"
      />
    </div>
  );
}
