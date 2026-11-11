import { SITE_URL } from "@/lib/site-config";

/**
 * Hosts allowed to call our write endpoints: the configured public site (and
 * its www variant) plus localhost for development. We validate the browser's
 * `Origin` against this list rather than against `new URL(request.url).origin`,
 * because behind a reverse proxy (e.g. Hostinger) the app sees an internal host
 * and http scheme — so the request URL never matches the public https origin.
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

/**
 * Require a request from an allowed origin. Rejects cross-origin AND
 * origin-less (scripted) POSTs — a browser fetch from our own pages always
 * sends an Origin.
 */
export function isAllowedOrigin(request: Request) {
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

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/**
 * Lightweight in-memory rate limiting. Per server instance rather than global,
 * but enough to blunt scripted spam against write endpoints.
 */
export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function isRateLimited(key: string) {
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }

    entry.count += 1;
    return entry.count > max;
  };
}

/**
 * Reads a JSON body with a hard size cap. Reads the raw text so the cap can't
 * be bypassed with a lying Content-Length (chunked transfer) header.
 */
export async function readJsonBody(
  request: Request,
  maxBytes: number,
): Promise<{ ok: true; body: unknown } | { ok: false; status: 400 | 413 | 415 }> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return { ok: false, status: 415 };
  }

  const raw = await request.text();
  if (raw.length > maxBytes) return { ok: false, status: 413 };

  try {
    return { ok: true, body: JSON.parse(raw) };
  } catch {
    return { ok: false, status: 400 };
  }
}
