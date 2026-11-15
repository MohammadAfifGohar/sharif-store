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
export const SITE_NAME = "The Sharif Store";

/** WhatsApp business number in wa.me format (country code + number, no `+`). */
export const WHATSAPP_NUMBER = "918421804744";

/** Customer care mailbox shown on Contact, Terms, Privacy and the footer. */
export const SUPPORT_EMAIL = "support@thesharifstore.in";

/**
 * Seller identity required by the Consumer Protection (E-Commerce) Rules,
 * 2020. The online brand is run by the person below for the physical shop.
 * Add the GSTIN here once registration is done and it will appear wherever
 * the seller details are shown.
 */
export const SELLER = {
  operatorName: "Mohammad Afif Gohar",
  shopName: "Sharif Gift Center",
  address:
    "Old Sarafa, Lohiya Maidan, near Dunda Maharaj Math, Deglur, Nanded, Maharashtra 431717",
  gstin: null as string | null,
} as const;

/** Grievance Officer, as required by the E-Commerce Rules and IT Rules. */
export const GRIEVANCE_OFFICER = {
  name: "Mohammad Afif Gohar",
  designation: "Grievance Officer",
  email: SUPPORT_EMAIL,
  phone: `+${WHATSAPP_NUMBER}`,
} as const;

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
