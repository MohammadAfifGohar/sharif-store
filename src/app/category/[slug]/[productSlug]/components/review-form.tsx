"use client";

import { FormEvent, useState } from "react";
import { LoaderCircleIcon, StarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Textarea } from "@/components/ui/textarea";

type ReviewFormProps = {
  productId: number;
  productName: string;
  enabled: boolean;
};

type SubmissionState =
  | { kind: "idle"; message: "" }
  | { kind: "success" | "error"; message: string };

export function ReviewForm({
  productId,
  productName,
  enabled,
}: ReviewFormProps) {
  const [rating, setRating] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<SubmissionState>({
    kind: "idle",
    message: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const selectedRating = Number(rating[0]);

    if (!selectedRating) {
      setSubmission({
        kind: "error",
        message: "Choose a rating before submitting your review.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmission({ kind: "idle", message: "" });

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: selectedRating,
          reviewer: data.get("reviewer"),
          reviewerEmail: data.get("reviewerEmail"),
          review: data.get("review"),
          website: data.get("website"),
        }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "The review could not be submitted.");
      }

      form.reset();
      setRating([]);
      setSubmission({
        kind: "success",
        message:
          result.message || "Thanks. Your review is awaiting approval.",
      });
    } catch (error) {
      setSubmission({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "The review could not be submitted.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mb-10 rounded-2xl border border-border bg-muted/20 p-5 sm:p-7">
      <div className="mb-6">
        <h3 className="font-heading text-xl font-semibold">
          Review {productName}
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Share your experience. Reviews are published after approval.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FieldSet disabled={!enabled || isSubmitting}>
          <FieldGroup className="grid gap-5 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel>Your rating</FieldLabel>
              <ToggleGroup
                value={rating}
                onValueChange={setRating}
                aria-label="Choose a rating"
                className="justify-start"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <ToggleGroupItem
                    key={value}
                    value={String(value)}
                    aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                    className="size-10 rounded-full border border-border data-[pressed]:border-primary data-[pressed]:bg-primary/10"
                  >
                    <StarIcon className="size-5 fill-current" />
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="reviewer">Name</FieldLabel>
              <Input
                id="reviewer"
                name="reviewer"
                className="h-12 rounded-sm"
                minLength={2}
                maxLength={80}
                autoComplete="name"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="reviewerEmail">Email</FieldLabel>
              <Input
                id="reviewerEmail"
                name="reviewerEmail"
                type="email"
                className="h-12 rounded-sm"
                maxLength={254}
                autoComplete="email"
                required
              />
              <FieldDescription>
                Your email will not be shown publicly.
              </FieldDescription>
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="review">Review</FieldLabel>
              <Textarea
                id="review"
                name="review"
                className="min-h-32 rounded-sm"
                minLength={10}
                maxLength={2000}
                rows={6}
                required
              />
            </Field>

            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <Field className="items-start sm:col-span-2">
              <Button
                type="submit"
                size="lg"
                className="w-fit! rounded-sm"
                disabled={!enabled || isSubmitting}
              >
                {isSubmitting ? (
                  <LoaderCircleIcon
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                ) : null}
                Submit review
              </Button>
              {!enabled ? (
                <FieldDescription>
                  Review submissions will open after WooCommerce access is
                  configured.
                </FieldDescription>
              ) : null}
              {submission.message ? (
                <p
                  className={
                    submission.kind === "success"
                      ? "text-sm font-medium text-emerald-700"
                      : "text-sm font-medium text-destructive"
                  }
                  role="status"
                >
                  {submission.message}
                </p>
              ) : null}
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
