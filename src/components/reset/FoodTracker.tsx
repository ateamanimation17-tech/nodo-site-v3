"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { searchFoods, lookupBarcode, type FoodResult } from "@/lib/foodApi";
import BarcodeScanner from "./BarcodeScanner";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";
const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

type FoodLog = {
  id: string;
  meal_type: MealType;
  name: string;
  brand: string | null;
  grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

type Targets = { calories: number; proteinG: number; carbsG: number; fatG: number };

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };

function toDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function scale(perHundred: number, grams: number) {
  return Math.round((perHundred * grams) / 100);
}

export default function FoodTracker({ targets }: { targets: Targets }) {
  const [date, setDate] = useState(() => toDateStr(new Date()));
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [picked, setPicked] = useState<FoodResult | null>(null);
  const [grams, setGrams] = useState("100");
  const [mealType, setMealType] = useState<MealType>("breakfast");

  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  async function loadLogs() {
    setLoading(true);
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("food_logs")
      .select("id, meal_type, name, brand, grams, calories, protein_g, carbs_g, fat_g")
      .eq("user_id", user.id)
      .eq("logged_date", date)
      .order("created_at", { ascending: true });
    setLogs((data as FoodLog[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function runSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const found = await searchFoods(query);
      setResults(found);
      if (found.length === 0) setSearchError("No matches. Try a simpler search term.");
    } catch {
      setSearchError("Search failed. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  }

  async function handleScanned(code: string) {
    setShowScanner(false);
    setScanError(null);
    const food = await lookupBarcode(code);
    if (!food) {
      setScanError(`No product found for barcode ${code}. Try searching by name instead.`);
      return;
    }
    setPicked(food);
    setGrams("100");
    setResults([]);
    setQuery("");
  }

  async function addLog() {
    if (!picked) return;
    const g = parseFloat(grams) || 100;
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const row = {
      user_id: user.id,
      logged_date: date,
      meal_type: mealType,
      name: picked.name,
      brand: picked.brand ?? null,
      grams: g,
      calories: scale(picked.caloriesPer100g, g),
      protein_g: scale(picked.proteinPer100g, g),
      carbs_g: scale(picked.carbsPer100g, g),
      fat_g: scale(picked.fatPer100g, g),
    };

    const { data, error } = await supabase.from("food_logs").insert(row).select().single();
    if (!error && data) {
      setLogs((prev) => [...prev, data as FoodLog]);
      setPicked(null);
      setResults([]);
      setQuery("");
    }
  }

  async function deleteLog(id: string) {
    const supabase = getSupabaseClient();
    await supabase.from("food_logs").delete().eq("id", id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  function shiftDate(days: number) {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + days);
    setDate(toDateStr(d));
  }

  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + l.calories,
      protein: acc.protein + l.protein_g,
      carbs: acc.carbs + l.carbs_g,
      fat: acc.fat + l.fat_g,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const isToday = date === toDateStr(new Date());

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="eyebrow">Food log</p>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftDate(-1)} className="btn-ghost rounded-full px-3 py-1.5 text-xs">
            ←
          </button>
          <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular min-w-[80px] text-center">
            {isToday ? "Today" : date}
          </span>
          <button
            onClick={() => shiftDate(1)}
            disabled={isToday}
            className="btn-ghost rounded-full px-3 py-1.5 text-xs disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2 mb-5 card px-5 py-4" style={{ background: "var(--bg-raised)" }}>
        <TotalStat label="Calories" value={totals.calories} target={targets.calories} />
        <TotalStat label="Protein" value={totals.protein} target={targets.proteinG} unit="g" />
        <TotalStat label="Carbs" value={totals.carbs} target={targets.carbsG} unit="g" />
        <TotalStat label="Fat" value={totals.fat} target={targets.fatG} unit="g" />
      </div>

      <div className="flex flex-col gap-2 mb-5">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Search a food, e.g. chicken breast"
            className="flex-1 rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          <button onClick={runSearch} disabled={searching} className="btn-ghost rounded-md px-4 py-2 text-sm">
            {searching ? "…" : "Search"}
          </button>
          <button onClick={() => setShowScanner(true)} className="btn-ghost rounded-md px-4 py-2 text-sm">
            Scan
          </button>
        </div>
        {searchError && <p className="text-xs text-[color:var(--ink-faint)]">{searchError}</p>}
        {scanError && <p className="text-xs text-[color:var(--ink-faint)]">{scanError}</p>}

        {results.length > 0 && !picked && (
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setPicked(r);
                  setGrams("100");
                }}
                className="flex items-center justify-between text-left rounded-lg px-3 py-2 text-sm"
                style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}
              >
                <span>
                  {r.name}
                  {r.brand && <span className="text-[color:var(--ink-faint)]"> — {r.brand}</span>}
                </span>
                <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular shrink-0 ml-2">
                  {r.caloriesPer100g} kcal/100g
                </span>
              </button>
            ))}
          </div>
        )}

        {picked && (
          <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {picked.name}
                {picked.brand && <span className="text-[color:var(--ink-faint)]"> — {picked.brand}</span>}
              </p>
              <button onClick={() => setPicked(null)} className="btn-ghost rounded-full px-2.5 py-1 text-xs">
                Cancel
              </button>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <input
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                placeholder="grams"
                className="w-20 rounded-md px-2 py-1.5 text-xs outline-none"
                style={inputStyle}
              />
              <span className="text-xs text-[color:var(--ink-faint)]">g</span>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="rounded-md px-2 py-1.5 text-xs outline-none capitalize"
                style={inputStyle}
              >
                {MEAL_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <button onClick={addLog} className="btn-ghost rounded-md px-4 py-1.5 text-xs">
                Add
              </button>
              <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular ml-auto">
                {scale(picked.caloriesPer100g, parseFloat(grams) || 0)} kcal
              </span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-[color:var(--ink-faint)]">Loading…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {MEAL_TYPES.map((meal) => {
            const items = logs.filter((l) => l.meal_type === meal);
            if (items.length === 0) return null;
            return (
              <div key={meal}>
                <p className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand mb-1.5">
                  {meal}
                </p>
                <div className="flex flex-col gap-1.5">
                  {items.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between text-sm py-1.5"
                      style={{ borderBottom: "1px solid var(--line)" }}
                    >
                      <span>
                        {l.name}{" "}
                        <span className="text-[color:var(--ink-faint)] text-xs font-mono-brand tabular">
                          {l.grams}g
                        </span>
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">
                          {l.calories} kcal
                        </span>
                        <button onClick={() => deleteLog(l.id)} className="btn-ghost rounded-full px-2 py-1 text-xs">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {logs.length === 0 && (
            <p className="text-sm text-[color:var(--ink-faint)]">Nothing logged yet — search or scan a food above.</p>
          )}
        </div>
      )}

      {showScanner && <BarcodeScanner onDetected={handleScanned} onClose={() => setShowScanner(false)} />}
    </div>
  );
}

function TotalStat({ label, value, target, unit }: { label: string; value: number; target: number; unit?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand">{label}</p>
      <p className="font-display text-xl tabular">
        {Math.round(value)}
        {unit ?? ""}{" "}
        <span className="text-sm text-[color:var(--ink-faint)]">
          / {target}
          {unit ?? ""}
        </span>
      </p>
    </div>
  );
}
