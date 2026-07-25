/**
 * Single source of truth for site-wide constants that were previously
 * hardcoded across components, the data layer and the reviews route.
 */

/**
 * Public storefront origin, used for canonical/OG URLs, metadataBase and the
 * reviews origin allowlist. Override per-environment with NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://thesharifstore.in";

/** Display brand name. Keep spelling consistent everywhere. */
export const SITE_NAME = "Sharif Store";

/** WhatsApp business number in wa.me format (country code + number, no `+`). */
export const WHATSAPP_NUMBER = "917020878764";

/**
 * WooCommerce / WordPress origin. Reads `WORDPRESS_URL` and normalises the
 * trailing slash. Falls back to the production API host so the app keeps
 * working when the env var is absent (e.g. preview builds).
 */
export function getWordpressUrl() {
  return (
    process.env.WORDPRESS_URL?.replace(/\/$/, "") ??
    "https://api.thesharifstore.in"
  );
}

/** Build an absolute storefront URL from a root-relative path. */
export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}
