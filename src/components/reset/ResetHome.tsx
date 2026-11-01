"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { ActivityLevel, Goal, Sex } from "@/lib/macros";
import ProfileForm from "./ProfileForm";
import WorkoutSection from "./WorkoutSection";
import NutritionSection from "./NutritionSection";

export type FitnessProfile = {
  sex: Sex;
  age: number;
  weight_kg: number;
  height_cm: number;
  activity_level: ActivityLevel;
  goal: Goal;
  training_days: number;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
};

export default function ResetHome() {
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  async function load() {
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
      .from("fitness_profiles")
      .select(
        "sex, age, weight_kg, height_cm, activity_level, goal, training_days, target_calories, target_protein_g, target_carbs_g, target_fat_g"
      )
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile(data ?? null);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-[color:var(--ink-faint)]">Loading…</p>;
  }

  if (!profile || editing) {
    return (
      <ProfileForm
        initial={profile}
        onSaved={(p) => {
          setProfile(p);
          setEditing(false);
        }}
        onCancel={profile ? () => setEditing(false) : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="card px-5 py-4 flex flex-wrap gap-x-8 gap-y-2">
          <Stat label="Calories" value={`${profile.target_calories}`} />
          <Stat label="Protein" value={`${profile.target_protein_g}g`} />
          <Stat label="Carbs" value={`${profile.target_carbs_g}g`} />
          <Stat label="Fat" value={`${profile.target_fat_g}g`} />
        </div>
        <button onClick={() => setEditing(true)} className="btn-ghost rounded-full px-4 py-2 text-xs shrink-0">
          Edit profile
        </button>
      </div>

      <WorkoutSection trainingDays={profile.training_days} />
      <NutritionSection targetCalories={profile.target_calories} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand">{label}</p>
      <p className="font-display text-xl tabular">{value}</p>
    </div>
  );
}
