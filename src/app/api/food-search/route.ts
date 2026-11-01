import { NextRequest, NextResponse } from "next/server";
import { mapOffProduct, OFF_USER_AGENT, type FoodResult, type OffProduct } from "@/lib/offShared";

export const runtime = "nodejs";

function dedupe(results: FoodResult[]): FoodResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.name}|${r.brand ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const FIELDS = "code,product_name,brands,nutriments";

// Search-a-licious: the current recommended full-text search API.
async function searchViaSearchALicious(query: string): Promise<FoodResult[] | null> {
  const url = `https://search.openfoodfacts.org/search?q=${encodeURIComponent(
    query
  )}&page_size=20&page=1&langs=en&fields=${FIELDS}`;

  const res = await fetch(url, { headers: { "User-Agent": OFF_USER_AGENT, Accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as { hits?: OffProduct[] };
  if (!Array.isArray(data.hits)) return null;
  return dedupe(data.hits.map(mapOffProduct).filter((p): p is FoodResult => p !== null));
}

// Legacy fallback — deprecated by Open Food Facts but still reachable
// server-side if the primary search is briefly unavailable.
async function searchViaLegacy(query: string): Promise<FoodResult[] | null> {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    query
  )}&search_simple=1&action=process&json=1&page_size=20&fields=${FIELDS}`;

  const res = await fetch(url, { headers: { "User-Agent": OFF_USER_AGENT, Accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as { products?: OffProduct[] };
  if (!Array.isArray(data.products)) return null;
  return dedupe(data.products.map(mapOffProduct).filter((p): p is FoodResult => p !== null));
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const primary = await searchViaSearchALicious(query);
    if (primary && primary.length > 0) {
      return NextResponse.json({ results: primary });
    }

    const fallback = await searchViaLegacy(query);
    if (fallback) {
      return NextResponse.json({ results: fallback });
    }

    // Both reachable but no matches
    return NextResponse.json({ results: primary ?? [] });
  } catch {
    return NextResponse.json({ error: "Food search is temporarily unavailable. Try again shortly." }, { status: 502 });
  }
}
