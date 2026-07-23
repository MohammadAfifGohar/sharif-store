import { z } from "zod";

export const reviewSubmissionSchema = z
  .object({
    productId: z.coerce
      .number()
      .int("This product could not be identified.")
      .positive("This product could not be identified."),
    rating: z.coerce
      .number()
      .int("Choose a rating from 1 to 5 stars.")
      .min(1, "Choose a rating from 1 to 5 stars.")
      .max(5, "Choose a rating from 1 to 5 stars."),
    reviewer: z
      .string()
      .trim()
      .min(2, "Enter a name between 2 and 80 characters.")
      .max(80, "Enter a name between 2 and 80 characters."),
    reviewerEmail: z
      .email("Enter a valid email address.")
      .trim()
      .toLowerCase()
      .max(254, "Enter a valid email address."),
    review: z
      .string()
      .trim()
      .min(10, "Write a review between 10 and 2,000 characters.")
      .max(2_000, "Write a review between 10 and 2,000 characters."),
    website: z.string().optional().default(""),
  })
  .strict();

export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>;
