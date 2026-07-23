import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { reviewSubmissionSchema } from "@/lib/review-submission";

const MAX_BODY_SIZE = 10_000;

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { message: "Send the review as JSON." },
      { status: 415 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json(
      { message: "The review is too large." },
      { status: 413 },
    );
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { message: "Review submission was not allowed." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "The review could not be read." },
      { status: 400 },
    );
  }

  if (
    body &&
    typeof body === "object" &&
    "website" in body &&
    typeof body.website === "string" &&
    body.website.length > 0
  ) {
    return NextResponse.json(
      { message: "Thanks. Your review is awaiting approval." },
      { status: 202 },
    );
  }

  const result = reviewSubmissionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        message:
          result.error.issues[0]?.message ?? "Invalid review submission.",
      },
      { status: 400 },
    );
  }

  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  const wordpressUrl =
    process.env.WORDPRESS_URL?.replace(/\/$/, "") ??
    "https://thesharifstore.in";

  if (!consumerKey || !consumerSecret) {
    return NextResponse.json(
      { message: "Review submissions are not configured yet." },
      { status: 503 },
    );
  }

  const response = await fetch(
    `${wordpressUrl}/wp-json/wc/v3/products/reviews`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${consumerKey}:${consumerSecret}`,
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: result.data.productId,
        reviewer: result.data.reviewer,
        reviewer_email: result.data.reviewerEmail,
        review: result.data.review,
        rating: result.data.rating,
        status: "hold",
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: "The review could not be submitted. Please try again." },
      { status: 502 },
    );
  }

  revalidateTag("woocommerce", { expire: 0 });

  return NextResponse.json(
    { message: "Thanks. Your review is awaiting approval." },
    { status: 202 },
  );
}
