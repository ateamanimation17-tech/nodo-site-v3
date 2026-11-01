import { RECIPES, type Recipe } from "./recipes";

export type DayPlan = { recipes: Recipe[] };

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildFiveDayPlan(targetCalories: number): DayPlan[] {
  const breakfasts = shuffled(RECIPES.filter((r) => r.mealType === "breakfast"));
  const lunches = shuffled(RECIPES.filter((r) => r.mealType === "lunch"));
  const dinners = shuffled(RECIPES.filter((r) => r.mealType === "dinner"));
  const snacks = shuffled(RECIPES.filter((r) => r.mealType === "snack"));

  const days: DayPlan[] = [];
  for (let i = 0; i < 5; i++) {
    const meals = [pick(breakfasts, i), pick(lunches, i), pick(dinners, i)];
    const subtotal = meals.reduce((sum, m) => sum + m.calories, 0);
    if (targetCalories - subtotal > 150 && snacks.length > 0) {
      meals.push(pick(snacks, i));
    }
    days.push({ recipes: meals });
  }
  return days;
}

export function dayTotals(day: DayPlan) {
  return day.recipes.reduce(
    (acc, r) => ({
      calories: acc.calories + r.calories,
      protein: acc.protein + r.protein,
      carbs: acc.carbs + r.carbs,
      fat: acc.fat + r.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function buildShoppingList(
  plan: DayPlan[]
): { item: string; quantity: number; unit: string }[] {
  const map = new Map<string, { item: string; quantity: number; unit: string }>();
  plan.forEach((day) => {
    day.recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ing) => {
        const key = `${ing.item}|${ing.unit}`;
        const existing = map.get(key);
        if (existing) {
          existing.quantity += ing.quantity;
        } else {
          map.set(key, { ...ing });
        }
      });
    });
  });
  return Array.from(map.values()).sort((a, b) => a.item.localeCompare(b.item));
}
