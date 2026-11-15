import type { CampaignSlide } from "@/app/(home)/components/campaign-hero";
import { decodeEntities, textFromHtml } from "@/lib/html-text";
import { getWordpressUrl, SITE_URL } from "@/lib/site-config";

/**
 * Home page banners managed from WordPress, so the store owner can change
 * them without a code deploy. Each banner is a published WordPress post in
 * the "Home Banner" category:
 *
 * - Title          → banner name (used as the image's alt text)
 * - Featured image → banner for computers and, by default, phones (2:1)
 * - First image in the post body (optional) → separate phone banner (4:5)
 * - Excerpt        → where the banner links, e.g. /category/bags-and-fashion
 *
 * Newest post shows first. Drafts are ignored. If the category is missing,
 * empty or WordPress can't be reached, the built-in banners are used.
 */
export const HOME_BANNER_CATEGORY_SLUG = "home-banner";

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_BANNERS = 8;

type WpMedia = {
  source_url?: string;
  media_details?: { width?: number; height?: number };
};

export type WpBannerPost = {
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  _embedded?: { "wp:featuredmedia"?: WpMedia[] };
};

type BannerImage = CampaignSlide["desktopImage"];

/**
 * Accepts only images uploaded to our own WordPress media library: Next's
 * image optimiser is limited to that host, and any other URL would break the
 * page.
 */
function toUploadsUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(decodeEntities(value));
    const wordpress = new URL(getWordpressUrl());
    return url.protocol === "https:" &&
      url.host === wordpress.host &&
      url.pathname.startsWith("/wp-content/uploads/")
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function toImage(
  src: string | undefined,
  width: number | undefined,
  height: number | undefined,
): BannerImage | null {
  const url = toUploadsUrl(src);
  if (!url || !width || !height || width <= 0 || height <= 0) return null;
  return { src: url, width, height };
}

function readAttribute(tag: string, name: string) {
  return tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1];
}

/** The first <img> in the post body, used as the optional phone banner. */
export function getPhoneImageFromContent(html: string | undefined) {
  const tag = html?.match(/<img\b[^>]*>/i)?.[0];
  if (!tag) return null;
  return toImage(
    readAttribute(tag, "src"),
    Number(readAttribute(tag, "width")),
    Number(readAttribute(tag, "height")),
  );
}

/**
 * The excerpt holds the banner's link. Only links within this store are
 * allowed; anything else falls back to the home page.
 */
export function getBannerHref(excerptHtml: string | undefined) {
  const text = textFromHtml(excerptHtml).split(" ")[0] ?? "";
  if (text.startsWith("/") && !text.startsWith("//")) return text;

  try {
    const url = new URL(text);
    const site = new URL(SITE_URL);
    if (url.host === site.host || url.host === `www.${site.host}`) {
      return `${url.pathname}${url.search}${url.hash}` || "/";
    }
  } catch {
    // Not a URL; fall through.
  }
  return "/";
}

/** Turns WordPress banner posts into home page slides, skipping incomplete ones. */
export function postsToSlides(posts: WpBannerPost[]): CampaignSlide[] {
  return posts.flatMap((post) => {
    const media = post._embedded?.["wp:featuredmedia"]?.[0];
    const desktopImage = toImage(
      media?.source_url,
      media?.media_details?.width,
      media?.media_details?.height,
    );
    if (!desktopImage) return [];

    const mobileImage = getPhoneImageFromContent(post.content?.rendered);
    const alt = textFromHtml(post.title?.rendered) || "Featured collection";

    return [
      {
        alt,
        desktopImage,
        ...(mobileImage ? { mobileImage } : {}),
        href: getBannerHref(post.excerpt?.rendered),
      },
    ];
  });
}

async function fetchWordpress<T>(path: string): Promise<T> {
  const response = await fetch(`${getWordpressUrl()}/wp-json/wp/v2/${path}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: { revalidate: 300, tags: ["woocommerce", "home-banners"] },
  });
  if (!response.ok) {
    throw new Error(`WordPress request failed with ${response.status}: ${path}`);
  }
  return response.json() as Promise<T>;
}

/** Banners from WordPress, or null to use the built-in ones. */
export async function getHomeBannerSlides(): Promise<CampaignSlide[] | null> {
  try {
    const categories = await fetchWordpress<Array<{ id: number }>>(
      `categories?slug=${HOME_BANNER_CATEGORY_SLUG}&_fields=id`,
    );
    const categoryId = categories[0]?.id;
    if (!categoryId) return null;

    const posts = await fetchWordpress<WpBannerPost[]>(
      `posts?categories=${categoryId}&per_page=${MAX_BANNERS}&orderby=date&order=desc&_embed=wp:featuredmedia`,
    );
    const slides = postsToSlides(posts);
    return slides.length > 0 ? slides : null;
  } catch (cause) {
    console.error("[home] could not load WordPress banners", cause);
    return null;
  }
}
