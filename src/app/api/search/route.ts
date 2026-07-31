import { NextResponse } from "next/server";

import { parseSearchQuery, toSearchResult } from "@/lib/product-search";
import { searchProducts } from "@/lib/woocommerce";

export async function GET(request: Request) {
  const query = parseSearchQuery(
    new URL(request.url).searchParams.get("q") ?? undefined,
  );

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const { products } = await searchProducts(query, 1, 6);
    return NextResponse.json({ results: products.map(toSearchResult) });
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
