import { NextResponse } from "next/server";

import { reviewSubmissionSchema } from "@/lib/review-submission";
import { getWordpressUrl, SITE_URL } from "@/lib/site-config";

const MAX_BODY_SIZE = 10_000;
const UPSTREAM_TIMEOUT_MS = 10_000;

/**
 * Hosts allowed to submit reviews: the configured public site (and its www
 * variant) plus localhost for development. We validate the browser's `Origin`
 * against this list rather than against `new URL(request.url).origin`, because
 * behind a reverse proxy (e.g. Hostinger) the app sees an internal host and
 * http scheme — so the request URL never matches the public https origin.
 */
function getAllowedHosts() {
  const siteHost = new URL(SITE_URL).host.toLowerCase();
  const wwwVariant = siteHost.startsWith("www.")
    ? siteHost.slice(4)
    : `www.${siteHost}`;

  return new Set([siteHost, wwwVariant]);
}

function isLocalhost(host: string) {
  const hostname = host.split(":")[0];
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  let originHost: string;
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    originHost = url.host.toLowerCase();
  } catch {
    return false;
  }

  return isLocalhost(originHost) || getAllowedHosts().has(originHost);
}

// Lightweight in-memory rate limiting. Per serverless instance rather than
// global, but enough to blunt scripted spam against this write endpoint.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { message: "Send the review as JSON." },
      { status: 415 },
    );
  }

  // Require a request from an allowed origin. Reject cross-origin AND
  // origin-less (scripted) POSTs — a browser form submission always sends an
  // Origin from the same site.
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { message: "Review submission was not allowed." },
      { status: 403 },
    );
  }

  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      { message: "Too many reviews submitted. Please try again shortly." },
      { status: 429 },
    );
  }

  // Read the raw body so the size cap can't be bypassed with a lying
  // Content-Length (chunked transfer) header.
  const raw = await request.text();
  if (raw.length > MAX_BODY_SIZE) {
    return NextResponse.json(
      { message: "The review is too large." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
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

  if (!consumerKey || !consumerSecret) {
    return NextResponse.json(
      { message: "Review submissions are not configured yet." },
      { status: 503 },
    );
  }

  let response: Response;
  try {
    response = await fetch(`${getWordpressUrl()}/wp-json/wc/v3/products/reviews`, {
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
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    // Network failure or timeout reaching WooCommerce.
    return NextResponse.json(
      { message: "The review could not be submitted. Please try again." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { message: "The review could not be submitted. Please try again." },
      { status: 502 },
    );
  }

  // New reviews are created with status "hold", so nothing user-visible
  // changed — no cache invalidation is needed. Approved reviews appear on the
  // next scheduled revalidation (revalidate: 300).

  return NextResponse.json(
    { message: "Thanks. Your review is awaiting approval." },
    { status: 202 },
  );
}
