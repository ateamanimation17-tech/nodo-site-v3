// Shared with the food-search / food-barcode API routes: mapping from
// Open Food Facts' raw product shape to our own simplified FoodResult.

export type FoodResult = {
  id: string; // barcode / product code, used as a stable key
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
};

export type OffNutriments = {
  "energy-kcal_100g"?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
};

export type OffProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  nutriments?: OffNutriments;
};

export function mapOffProduct(p: OffProduct): FoodResult | null {
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

// Open Food Facts asks integrations to identify themselves with a
// descriptive User-Agent. Browsers block setting this on client-side
// fetch, which is one reason this lookup runs server-side instead.
export const OFF_USER_AGENT = "NODOLifestyle/1.0 (https://nodolifestyle.com)";
