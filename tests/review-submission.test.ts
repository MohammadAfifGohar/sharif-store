import assert from "node:assert/strict";
import test from "node:test";

import { reviewSubmissionSchema } from "../src/lib/review-submission";

const validReview = {
  productId: 42,
  rating: 5,
  reviewer: "Aisha",
  reviewerEmail: "AISHA@example.com",
  review: "A genuinely useful product that I would buy again.",
  website: "",
};

test("normalizes a valid review", () => {
  assert.deepEqual(reviewSubmissionSchema.parse(validReview), {
    ...validReview,
    reviewerEmail: "aisha@example.com",
  });
});

test("rejects a rating outside the supported range", () => {
  const result = reviewSubmissionSchema.safeParse({
    ...validReview,
    rating: 6,
  });

  assert.equal(result.success, false);
});

test("rejects an invalid email address", () => {
  const result = reviewSubmissionSchema.safeParse({
    ...validReview,
    reviewerEmail: "not-an-email",
  });

  assert.equal(result.success, false);
});

test("rejects a review that is too short", () => {
  const result = reviewSubmissionSchema.safeParse({
    ...validReview,
    review: "Nice",
  });

  assert.equal(result.success, false);
});
