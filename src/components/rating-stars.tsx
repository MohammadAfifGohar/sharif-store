import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type RatingStarsProps = {
  /** Rating from 0-5; rendered rounded to whole stars. */
  rating: number;
  className?: string;
  /** Tailwind size class for each star (defaults to `size-4`). */
  starClassName?: string;
};

export function RatingStars({
  rating,
  className,
  starClassName = "size-4",
}: RatingStarsProps) {
  const filled = Math.round(rating);

  return (
    <span
      className={cn("flex gap-0.5", className)}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          aria-hidden="true"
          className={cn(
            starClassName,
            index < filled
              ? "fill-primary text-primary"
              : "fill-muted text-border",
          )}
        />
      ))}
    </span>
  );
}
