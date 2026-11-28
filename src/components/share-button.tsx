"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, Share2Icon } from "lucide-react";

import { decodeEntities } from "@/lib/html-text";
import { cn } from "@/lib/utils";

/**
 * Shares the current page. Opens the phone's share sheet (WhatsApp etc.)
 * where the browser supports it, otherwise copies the link.
 */
export function ShareButton({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function share() {
    const url = window.location.href;
    const shareTitle = decodeEntities(title);

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, url });
        return;
      } catch (error) {
        // The shopper closed the share sheet; nothing else to do.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? "Link copied" : `Share ${decodeEntities(title)}`}
      title={copied ? "Link copied" : "Share"}
      className={cn(
        "relative grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-background transition-[color,border-color,transform] hover:border-primary/40 hover:text-primary active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        copied && "text-primary",
        className,
      )}
    >
      {copied ? (
        <CheckIcon className="size-[18px]" strokeWidth={2} />
      ) : (
        <Share2Icon className="size-[18px]" strokeWidth={2} />
      )}
      <span
        role="status"
        className={cn(
          "pointer-events-none absolute -top-9 right-0 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow transition-opacity",
          copied ? "opacity-100" : "opacity-0",
        )}
      >
        {copied ? "Link copied" : ""}
      </span>
    </button>
  );
}
