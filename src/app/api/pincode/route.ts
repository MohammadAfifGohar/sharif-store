import { NextResponse } from "next/server";

import { parseIndiaPostResponse } from "@/lib/pincode";

const TIMEOUT_MS = 6_000;

/**
 * City and state for a PIN code, from India Post. Answers are cached for a
 * day, so a PIN code is looked up there at most once a day.
 */
export async function GET(request: Request) {
  const pin = new URL(request.url).searchParams.get("pin")?.trim() ?? "";
  if (!/^[1-9]\d{5}$/.test(pin)) {
    return NextResponse.json({ error: "invalid_pin" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`India Post answered ${response.status}`);

    const info = parseIndiaPostResponse(pin, await response.json());
    if (!info) {
      return NextResponse.json({ error: "unknown_pin" }, {
        status: 404,
        headers: { "Cache-Control": "public, max-age=3600" },
      });
    }
    return NextResponse.json(info, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    });
  } catch (cause) {
    console.error("[pincode] lookup failed", cause);
    // The shopper can still type the city; nothing is blocked.
    return NextResponse.json({ error: "lookup_failed" }, { status: 503 });
  }
}
