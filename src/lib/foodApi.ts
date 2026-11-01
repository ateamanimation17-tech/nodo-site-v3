// Open Food Facts public API — free, no key required.
// Nutriments are returned per 100g; callers scale by the logged gram amount.

export type FoodResult = {
  id: string; // barcode / product code, used as a stable key
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
};

type OffNutriments = {
  "energy-kcal_100g"?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
};

type OffProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  nutriments?: OffNutriments;
};

function mapProduct(p: OffProduct): FoodResult | null {
  if (!p.product_name || !p.nutriments) return null;
  const n = p.nutriments;
  if (n["energy-kcal_100g"] == null) return null;
  return {
    id: p.code ?? p.product_name,
    name: p.product_name,
    brand: p.brands?.split(",")[0]?.trim(),
    caloriesPer100g: Math.round(n["energy-kcal_100g"] ?? 0),
    proteinPer100g: Math.round((n.proteins_100g ?? 0) * 10) / 10,
    carbsPer100g: Math.round((n.carbohydrates_100g ?? 0) * 10) / 10,
    fatPer100g: Math.round((n.fat_100g ?? 0) * 10) / 10,
  };
}

const FIELDS = "code,product_name,brands,nutriments";

export async function searchFoods(query: string): Promise<FoodResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    trimmed
  )}&search_simple=1&action=process&json=1&page_size=20&fields=${FIELDS}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as { products?: OffProduct[] };
  const results = (data.products ?? [])
    .map(mapProduct)
    .filter((p): p is FoodResult => p !== null);

  // De-dupe by name+brand, keep first occurrence
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.name}|${r.brand ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function lookupBarcode(barcode: string): Promise<FoodResult | null> {
  const trimmed = barcode.trim();
  if (!trimmed) return null;
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
    trimmed
  )}.json?fields=${FIELDS}`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as { status?: number; product?: OffProduct };
  if (data.status !== 1 || !data.product) return null;
  return mapProduct(data.product);
}
