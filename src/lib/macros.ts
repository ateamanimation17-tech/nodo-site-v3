export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "cut" | "maintain" | "bulk";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENT: Record<Goal, number> = {
  cut: -500,
  maintain: 0,
  bulk: 300,
};

export function calculateMacros(params: {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}) {
  const { sex, age, weightKg, heightCm, activityLevel, goal } = params;

  // Mifflin-St Jeor BMR, then scaled by activity and goal. General
  // estimates, not medical advice.
  const bmr =
    sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  const calories = Math.max(Math.round(tdee + GOAL_ADJUSTMENT[goal]), 1200);

  const proteinG = Math.round(weightKg * 2);
  const fatKcal = calories * 0.25;
  const fatG = Math.round(fatKcal / 9);
  const proteinKcal = proteinG * 4;
  const carbsKcal = Math.max(calories - proteinKcal - fatKcal, 0);
  const carbsG = Math.round(carbsKcal / 4);

  return { calories, proteinG, carbsG, fatG };
}
