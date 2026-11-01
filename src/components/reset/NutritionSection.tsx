"use client";

import { useEffect, useState } from "react";
import { buildFiveDayPlan, buildShoppingList, dayTotals, type DayPlan } from "@/lib/mealPlan";
import type { Recipe } from "@/lib/recipes";

export default function NutritionSection({ targetCalories }: { targetCalories: number }) {
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlan(buildFiveDayPlan(targetCalories));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCalories]);

  function shuffle() {
    setPlan(buildFiveDayPlan(targetCalories));
    setExpanded(null);
  }

  if (plan.length === 0) return null;

  const day = plan[activeDay];
  const totals = dayTotals(day);
  const shoppingList = buildShoppingList(plan);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="eyebrow">5-day meal rotation</p>
        <div className="flex gap-2">
          <button onClick={shuffle} className="btn-ghost rounded-full px-4 py-2 text-xs">
            Shuffle
          </button>
          <button onClick={() => setShowShoppingList((v) => !v)} className="btn-ghost rounded-full px-4 py-2 text-xs">
            {showShoppingList ? "Hide" : "Show"} shopping list
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {plan.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveDay(i);
              setExpanded(null);
            }}
            className="rounded-full px-4 py-2 text-sm transition-colors"
            style={{
              border: `1px solid ${i === activeDay ? "var(--accent)" : "var(--line-strong)"}`,
              color: i === activeDay ? "var(--ink)" : "var(--ink-dim)",
            }}
          >
            Day {i + 1}
          </button>
        ))}
      </div>

      {showShoppingList ? (
        <div className="flex flex-col gap-1.5">
          {shoppingList.map((item) => (
            <div
              key={`${item.item}-${item.unit}`}
              className="flex justify-between text-sm py-1.5"
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              <span>{item.item}</span>
              <span className="text-[color:var(--ink-faint)] font-mono-brand tabular">
                {Math.round(item.quantity * 10) / 10}
                {item.unit}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <>
          <p className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular mb-4">
            {totals.calories} kcal · {totals.protein}p / {totals.carbs}c / {totals.fat}f — target {targetCalories} kcal
          </p>
          <div className="flex flex-col gap-2.5">
            {day.recipes.map((recipe) => (
              <RecipeRow
                key={recipe.id}
                recipe={recipe}
                expanded={expanded === recipe.id}
                onToggle={() => setExpanded(expanded === recipe.id ? null : recipe.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RecipeRow({
  recipe,
  expanded,
  onToggle,
}: {
  recipe: Recipe;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand">
            {recipe.mealType}
          </p>
          <p className="text-[15px] font-medium">{recipe.name}</p>
        </div>
        <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">{recipe.calories} kcal</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          <p className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">
            {recipe.protein}p / {recipe.carbs}c / {recipe.fat}f
          </p>
          <div>
            <p className="text-xs uppercase tracking-wide text-[color:var(--ink-faint)] mb-1.5">Ingredients</p>
            <ul className="text-sm text-[color:var(--ink-dim)] flex flex-col gap-1">
              {recipe.ingredients.map((ing) => (
                <li key={ing.item}>
                  {ing.quantity}
                  {ing.unit} {ing.item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[color:var(--ink-faint)] mb-1.5">Instructions</p>
            <ol className="text-sm text-[color:var(--ink-dim)] flex flex-col gap-1 list-decimal list-inside">
              {recipe.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
