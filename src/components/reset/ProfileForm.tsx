"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { calculateMacros, type ActivityLevel, type Goal, type Sex } from "@/lib/macros";
import type { FitnessProfile } from "./ResetHome";

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };

export default function ProfileForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: FitnessProfile | null;
  onSaved: (profile: FitnessProfile) => void;
  onCancel?: () => void;
}) {
  const [sex, setSex] = useState<Sex>(initial?.sex ?? "male");
  const [age, setAge] = useState(initial ? String(initial.age) : "");
  const [weightKg, setWeightKg] = useState(initial ? String(initial.weight_kg) : "");
  const [heightCm, setHeightCm] = useState(initial ? String(initial.height_cm) : "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initial?.activity_level ?? "moderate");
  const [goal, setGoal] = useState<Goal>(initial?.goal ?? "maintain");
  const [trainingDays, setTrainingDays] = useState(initial?.training_days ?? 4);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    const weightNum = parseFloat(weightKg);
    const heightNum = parseFloat(heightCm);
    if (!ageNum || !weightNum || !heightNum) {
      setError("Fill in age, weight, and height.");
      return;
    }
    setSaving(true);
    setError(null);

    const macros = calculateMacros({
      sex,
      age: ageNum,
      weightKg: weightNum,
      heightCm: heightNum,
      activityLevel,
      goal,
    });

    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const row = {
      user_id: user.id,
      sex,
      age: ageNum,
      weight_kg: weightNum,
      height_cm: heightNum,
      activity_level: activityLevel,
      goal,
      training_days: trainingDays,
      target_calories: macros.calories,
      target_protein_g: macros.proteinG,
      target_carbs_g: macros.carbsG,
      target_fat_g: macros.fatG,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("fitness_profiles")
      .upsert(row, { onConflict: "user_id" });

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    onSaved({
      sex,
      age: ageNum,
      weight_kg: weightNum,
      height_cm: heightNum,
      activity_level: activityLevel,
      goal,
      training_days: trainingDays,
      target_calories: macros.calories,
      target_protein_g: macros.proteinG,
      target_carbs_g: macros.carbsG,
      target_fat_g: macros.fatG,
    });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4 max-w-xl">
      <p className="eyebrow">Your profile</p>
      <p className="text-sm text-[color:var(--ink-dim)] leading-relaxed -mt-2">
        General estimates from standard formulas, not medical advice — adjust as you learn what works for you.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="text-sm flex flex-col gap-1.5">
          Sex
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as Sex)}
            className="rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
            style={inputStyle}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label className="text-sm flex flex-col gap-1.5">
          Age
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
            style={inputStyle}
          />
        </label>
        <label className="text-sm flex flex-col gap-1.5">
          Weight (kg)
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
            style={inputStyle}
          />
        </label>
        <label className="text-sm flex flex-col gap-1.5">
          Height (cm)
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
            style={inputStyle}
          />
        </label>
        <label className="text-sm flex flex-col gap-1.5">
          Activity level
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
            className="rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
            style={inputStyle}
          >
            <option value="sedentary">Sedentary (little/no exercise)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
            <option value="very_active">Very active (physical job + training)</option>
          </select>
        </label>
        <label className="text-sm flex flex-col gap-1.5">
          Goal
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value as Goal)}
            className="rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
            style={inputStyle}
          >
            <option value="cut">Cut (lose fat)</option>
            <option value="maintain">Maintain</option>
            <option value="bulk">Bulk (gain muscle)</option>
          </select>
        </label>
      </div>

      <label className="text-sm flex flex-col gap-1.5">
        Training days per week
        <div className="flex gap-2">
          {[3, 4, 5].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setTrainingDays(d)}
              className="rounded-full px-4 py-2 text-sm transition-colors"
              style={{
                border: `1px solid ${trainingDays === d ? "var(--accent)" : "var(--line-strong)"}`,
                color: trainingDays === d ? "var(--ink)" : "var(--ink-dim)",
              }}
            >
              {d} days
            </button>
          ))}
        </div>
      </label>

      {error && (
        <p className="text-sm" style={{ color: "#e5787c" }}>
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        <button type="submit" disabled={saving} className="btn-accent rounded-full px-6 py-2.5 text-sm disabled:opacity-60">
          {saving ? "Saving…" : "Save & build my plan"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost rounded-full px-6 py-2.5 text-sm">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
