import type { FoodResult } from "./offShared";

export type { FoodResult };

export async function searchFoods(query: string): Promise<FoodResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const res = await fetch(`/api/food-search?q=${encodeURIComponent(trimmed)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Search failed (${res.status})`);
  }
  const data = (await res.json()) as { results?: FoodResult[] };
  return data.results ?? [];
}

export async function lookupBarcode(barcode: string): Promise<FoodResult | null> {
  const trimmed = barcode.trim();
  if (!trimmed) return null;

  const res = await fetch(`/api/food-barcode?code=${encodeURIComponent(trimmed)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Lookup failed (${res.status})`);
  }
  const data = (await res.json()) as { result?: FoodResult | null };
  return data.result ?? null;
}
