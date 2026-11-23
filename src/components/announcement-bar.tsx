"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

type AnnouncementOffer = { code: string; title: string };

const ROTATE_EVERY_MS = 5000;

/**
 * The pink strip above the header. Shows the coupons marked `[show]` in
 * WooCommerce, one at a time, with a tap-to-copy code. Without any offers it
 * shows the fallback line.
 */
export function AnnouncementBar({
  offers,
  fallback,
}: {
  offers: AnnouncementOffer[];
  fallback: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (offers.length < 2 || paused) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % offers.length),
      ROTATE_EVERY_MS,
    );
    return () => window.clearInterval(timer);
  }, [offers.length, paused]);

  useEffect(() => {
    if (!copiedCode) return;
    const timer = window.setTimeout(() => setCopiedCode(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copiedCode]);

  const offer = offers[index % Math.max(offers.length, 1)];

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
    } catch {
      // Clipboard can be blocked; the code is still readable on screen.
    }
  };

  return (
    <div
      role="region"
      aria-label="Store offers"
      className="flex min-h-9 items-center justify-center bg-primary px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-primary-foreground sm:text-xs sm:tracking-[0.18em]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {offer ? (
        <p
          key={offer.code}
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
        >
          <span>{offer.title}</span>
          <button
            type="button"
            onClick={() => void copyCode(offer.code)}
            className="inline-flex items-center gap-1 rounded-sm border border-dashed border-primary-foreground/60 px-1.5 py-0.5 tracking-[0.12em] transition-colors hover:bg-primary-foreground/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
            aria-label={`Copy coupon code ${offer.code}`}
          >
            Code {offer.code}
            {copiedCode === offer.code ? (
              <CheckIcon aria-hidden="true" className="size-3" />
            ) : (
              <CopyIcon aria-hidden="true" className="size-3" />
            )}
          </button>
          <span aria-live="polite" className="sr-only">
            {copiedCode === offer.code ? "Coupon code copied" : ""}
          </span>
        </p>
      ) : (
        <p>{fallback}</p>
      )}
    </div>
  );
}
