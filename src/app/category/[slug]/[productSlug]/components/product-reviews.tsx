import { CheckCircle2Icon, StarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getProductReviews } from "@/lib/woocommerce";
import { textFromHtml } from "@/lib/html-text";
import { cn } from "@/lib/utils";

function RatingStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          aria-hidden="true"
          className={cn(
            "size-4",
            index < rating
              ? "fill-[#e80071] text-[#e80071]"
              : "fill-muted text-border",
          )}
        />
      ))}
    </div>
  );
}

function ReviewInitial({ reviewer }: { reviewer: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary font-bold text-primary"
    >
      {reviewer.trim().charAt(0).toUpperCase() || "C"}
    </span>
  );
}

type ProductReviewsProps = {
  productId: number;
  reviewCount: number;
  averageRating: number;
};

export async function ProductReviews({
  productId,
  reviewCount,
  averageRating,
}: ProductReviewsProps) {
  const reviews = await getProductReviews(productId);

  return (
    <section
      aria-labelledby="product-reviews-heading"
      className="mt-14 border-t border-border pt-10 sm:mt-20 sm:pt-14"
    >
      <div className="mb-7 flex flex-col gap-3 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            From our customers
          </p>
          <h2
            id="product-reviews-heading"
            className="mt-2 font-heading text-2xl font-semibold sm:text-3xl"
          >
            Customer reviews
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {reviewCount > 0 ? (
            <>
              <span className="font-heading text-3xl font-semibold">
                {averageRating.toFixed(1)}
              </span>
              <div>
                <RatingStars rating={Math.round(averageRating)} />
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on {reviewCount}{" "}
                  {reviewCount === 1 ? "review" : "reviews"}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">
              0 customer reviews
            </p>
          )}
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-border bg-background p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <ReviewInitial reviewer={review.reviewer} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{review.reviewer}</p>
                    <RatingStars rating={review.rating} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {review.formatted_date_created}
                  </p>
                </div>
              </div>

              <p className="mt-5 leading-7 text-muted-foreground">
                {textFromHtml(review.review) || "No written feedback provided."}
              </p>

              {review.verified ? (
                <Badge variant="secondary" className="mt-5">
                  <CheckCircle2Icon data-icon="inline-start" />
                  Verified purchase
                </Badge>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-muted/30 px-5 py-10 text-center sm:px-8 sm:py-12">
          <h3 className="font-heading text-xl font-semibold">
            No reviews yet
          </h3>
          <p className="mx-auto mt-2 max-w-md leading-7 text-muted-foreground">
            Customer feedback added in WooCommerce will appear here
            automatically.
          </p>
        </div>
      )}
    </section>
  );
}

export function ProductReviewsSkeleton() {
  return (
    <section
      aria-label="Loading customer reviews"
      className="mt-14 border-t border-border pt-10 sm:mt-20 sm:pt-14"
    >
      <div className="h-8 w-52 animate-pulse rounded bg-muted" />
      <div className="mt-7 h-32 animate-pulse rounded-xl bg-muted/70" />
    </section>
  );
}
