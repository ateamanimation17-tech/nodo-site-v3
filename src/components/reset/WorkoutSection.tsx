"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { WORKOUT_SPLITS } from "@/lib/workoutPrograms";

type LoggedSet = { weight_kg: number | null; reps: number | null; logged_at: string };

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };

export default function WorkoutSection({ trainingDays }: { trainingDays: number }) {
  const days = WORKOUT_SPLITS[trainingDays] ?? WORKOUT_SPLITS[4];
  const [activeDay, setActiveDay] = useState(0);
  const [recent, setRecent] = useState<Record<string, LoggedSet[]>>({});
  const [weightInputs, setWeightInputs] = useState<Record<string, string>>({});
  const [repsInputs, setRepsInputs] = useState<Record<string, string>>({});

  async function loadRecent() {
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const exerciseNames = Array.from(new Set(days.flatMap((d) => d.exercises.map((e) => e.name))));
    const { data } = await supabase
      .from("workout_logs")
      .select("exercise_name, weight_kg, reps, logged_at")
      .eq("user_id", user.id)
      .in("exercise_name", exerciseNames)
      .order("logged_at", { ascending: false })
      .limit(200);

    const byExercise: Record<string, LoggedSet[]> = {};
    (data ?? []).forEach((row) => {
      const list = byExercise[row.exercise_name] ?? [];
      if (list.length < 3) {
        list.push(row);
        byExercise[row.exercise_name] = list;
      }
    });
    setRecent(byExercise);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRecent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingDays]);

  async function logSet(dayLabel: string, exerciseName: string, setNumber: number) {
    const key = `${exerciseName}-${setNumber}`;
    const weight = parseFloat(weightInputs[key] ?? "");
    const reps = parseInt(repsInputs[key] ?? "", 10);
    if (!weight && !reps) return;

    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("workout_logs").insert({
      user_id: user.id,
      day_label: dayLabel,
      exercise_name: exerciseName,
      set_number: setNumber,
      weight_kg: weight || null,
      reps: reps || null,
    });

    setRecent((prev) => {
      const list = [
        { weight_kg: weight || null, reps: reps || null, logged_at: new Date().toISOString() },
        ...(prev[exerciseName] ?? []),
      ].slice(0, 3);
      return { ...prev, [exerciseName]: list };
    });
    setWeightInputs((prev) => ({ ...prev, [key]: "" }));
    setRepsInputs((prev) => ({ ...prev, [key]: "" }));
  }

  const day = days[activeDay];

  return (
    <div className="card p-6">
      <p className="eyebrow mb-4">Workout</p>
      <div className="flex gap-2 flex-wrap mb-6">
        {days.map((d, i) => (
          <button
            key={d.label}
            onClick={() => setActiveDay(i)}
            className="rounded-full px-4 py-2 text-sm transition-colors"
            style={{
              border: `1px solid ${i === activeDay ? "var(--accent)" : "var(--line-strong)"}`,
              color: i === activeDay ? "var(--ink)" : "var(--ink-dim)",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {day.exercises.map((exercise) => {
          const lastSets = recent[exercise.name] ?? [];
          return (
            <div
              key={exercise.name}
              className="rounded-xl p-4"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[15px] font-medium">{exercise.name}</p>
                <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">
                  {exercise.sets} × {exercise.reps}
                </span>
              </div>
              {lastSets.length > 0 && (
                <p className="text-xs text-[color:var(--ink-faint)] mb-2">
                  Last: {lastSets.map((s) => `${s.weight_kg ?? "–"}kg×${s.reps ?? "–"}`).join(", ")}
                </p>
              )}
              <div className="flex gap-2 items-center flex-wrap">
                {Array.from({ length: exercise.sets }).map((_, setIdx) => {
                  const setNumber = setIdx + 1;
                  const key = `${exercise.name}-${setNumber}`;
                  return (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[color:var(--ink-faint)] font-mono-brand">#{setNumber}</span>
                      <input
                        value={weightInputs[key] ?? ""}
                        onChange={(e) => setWeightInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder="kg"
                        className="w-14 rounded-md px-2 py-1.5 text-xs outline-none"
                        style={inputStyle}
                      />
                      <input
                        value={repsInputs[key] ?? ""}
                        onChange={(e) => setRepsInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder="reps"
                        className="w-14 rounded-md px-2 py-1.5 text-xs outline-none"
                        style={inputStyle}
                      />
                      <button
                        onClick={() => logSet(day.label, exercise.name, setNumber)}
                        className="btn-ghost rounded-md px-2.5 py-1.5 text-xs"
                      >
                        Log
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
