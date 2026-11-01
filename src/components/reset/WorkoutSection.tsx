"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { WORKOUT_SPLITS } from "@/lib/workoutPrograms";

type LoggedSet = { weight_kg: number | null; reps: number | null; logged_at: string };

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };
const REST_PRESETS = [30, 60, 90, 120];

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => ctx.close();
  } catch {
    // Web Audio unavailable — fail silently, the visual countdown still works
  }
}

export default function WorkoutSection({ trainingDays }: { trainingDays: number }) {
  const days = WORKOUT_SPLITS[trainingDays] ?? WORKOUT_SPLITS[4];
  const [activeDay, setActiveDay] = useState(0);
  const [recent, setRecent] = useState<Record<string, LoggedSet[]>>({});
  const [weightInputs, setWeightInputs] = useState<Record<string, string>>({});
  const [repsInputs, setRepsInputs] = useState<Record<string, string>>({});

  const [restDuration, setRestDuration] = useState(90);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    if (remaining === null || paused) return;
    if (remaining <= 0) {
      playBeep();
      const t = setTimeout(() => setRemaining(null), 0);
      return () => clearTimeout(t);
    }
    tickRef.current = setInterval(() => {
      setRemaining((r) => (r === null ? null : r - 1));
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [remaining, paused]);

  function startRest() {
    setPaused(false);
    setRemaining(restDuration);
  }

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
    startRest();
  }

  const day = days[activeDay];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="eyebrow">Workout</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[color:var(--ink-faint)]">Rest</span>
          {REST_PRESETS.map((s) => (
            <button
              key={s}
              onClick={() => setRestDuration(s)}
              className="rounded-full px-3 py-1.5 text-xs transition-colors"
              style={{
                border: `1px solid ${s === restDuration ? "var(--accent)" : "var(--line-strong)"}`,
                color: s === restDuration ? "var(--ink)" : "var(--ink-dim)",
              }}
            >
              {s}s
            </button>
          ))}
        </div>
      </div>

      {remaining !== null && (
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3 mb-5"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--accent)" }}
        >
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl tabular">{remaining}s</span>
            <span className="text-xs text-[color:var(--ink-faint)]">rest</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRemaining((r) => (r ?? 0) + 15)} className="btn-ghost rounded-full px-3 py-1.5 text-xs">
              +15s
            </button>
            <button onClick={() => setPaused((p) => !p)} className="btn-ghost rounded-full px-3 py-1.5 text-xs">
              {paused ? "Resume" : "Pause"}
            </button>
            <button onClick={() => setRemaining(null)} className="btn-ghost rounded-full px-3 py-1.5 text-xs">
              Skip
            </button>
          </div>
        </div>
      )}

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
