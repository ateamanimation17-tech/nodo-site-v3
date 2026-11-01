"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type DailyLog = {
  log_date: string;
  steps_10k: boolean;
  no_vices: boolean;
  supplements: boolean;
  gym_session: boolean;
  cardio: boolean;
  mindset_minutes: boolean;
  water_ml: number;
  water_goal_ml: number;
  weight_kg: number | null;
  notes: string | null;
};

type HabitKey = "steps_10k" | "no_vices" | "supplements" | "gym_session" | "cardio" | "mindset_minutes";

const HABITS: { key: HabitKey; label: string }[] = [
  { key: "steps_10k", label: "10k steps" },
  { key: "no_vices", label: "No vices" },
  { key: "supplements", label: "Supplements" },
  { key: "gym_session", label: "Gym session" },
  { key: "cardio", label: "Cardio" },
  { key: "mindset_minutes", label: "15 min mindset time" },
];

const WATER_STEPS = [250, 500];

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyLog(date: string): DailyLog {
  return {
    log_date: date,
    steps_10k: false,
    no_vices: false,
    supplements: false,
    gym_session: false,
    cardio: false,
    mindset_minutes: false,
    water_ml: 0,
    water_goal_ml: 2500,
    weight_kg: null,
    notes: null,
  };
}

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };

export default function DailyCheckin() {
  const date = todayStr();
  const [log, setLog] = useState<DailyLog>(() => emptyLog(date));
  const [loading, setLoading] = useState(true);
  const [weightInput, setWeightInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [recentWeights, setRecentWeights] = useState<{ log_date: string; weight_kg: number }[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

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
      .from("reset_daily_logs")
      .select(
        "log_date, steps_10k, no_vices, supplements, gym_session, cardio, mindset_minutes, water_ml, water_goal_ml, weight_kg, notes"
      )
      .eq("user_id", user.id)
      .eq("log_date", date)
      .maybeSingle();

    const current = (data as DailyLog | null) ?? emptyLog(date);
    setLog(current);
    setWeightInput(current.weight_kg != null ? String(current.weight_kg) : "");
    setNotesInput(current.notes ?? "");

    const { data: history } = await supabase
      .from("reset_daily_logs")
      .select("log_date, weight_kg")
      .eq("user_id", user.id)
      .not("weight_kg", "is", null)
      .order("log_date", { ascending: false })
      .limit(5);
    setRecentWeights((history as { log_date: string; weight_kg: number }[]) ?? []);

    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function persist(next: DailyLog) {
    setSaveState("saving");
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("reset_daily_logs")
      .upsert({ ...next, user_id: user.id }, { onConflict: "user_id,log_date" });

    setSaveState(error ? "idle" : "saved");
  }

  function toggleHabit(key: HabitKey) {
    const next = { ...log, [key]: !log[key] };
    setLog(next);
    persist(next);
  }

  function addWater(ml: number) {
    const next = { ...log, water_ml: Math.max(log.water_ml + ml, 0) };
    setLog(next);
    persist(next);
  }

  function saveWeight() {
    const value = weightInput.trim() === "" ? null : parseFloat(weightInput);
    const next = { ...log, weight_kg: value };
    setLog(next);
    persist(next);
    if (value != null) {
      setRecentWeights((prev) => [{ log_date: date, weight_kg: value }, ...prev.filter((w) => w.log_date !== date)].slice(0, 5));
    }
  }

  function saveNotes() {
    const next = { ...log, notes: notesInput.trim() === "" ? null : notesInput };
    setLog(next);
    persist(next);
  }

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-[color:var(--ink-faint)]">Loading…</p>
      </div>
    );
  }

  const waterHit = log.water_ml >= log.water_goal_ml;
  const waterPct = Math.min(Math.round((log.water_ml / log.water_goal_ml) * 100), 100);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="eyebrow">Daily check-in</p>
        <span className="text-xs text-[color:var(--ink-faint)]">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </span>
      </div>

      <div className="flex flex-col gap-2 mb-5">
        {HABITS.map((h) => (
          <button
            key={h.key}
            onClick={() => toggleHabit(h.key)}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-left"
            style={{
              background: "var(--bg-raised)",
              border: `1px solid ${log[h.key] ? "var(--accent)" : "var(--line)"}`,
            }}
          >
            <span>{h.label}</span>
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
              style={{
                background: log[h.key] ? "var(--accent)" : "transparent",
                border: `1px solid ${log[h.key] ? "var(--accent)" : "var(--line-strong)"}`,
                color: log[h.key] ? "var(--bg)" : "transparent",
              }}
            >
              ✓
            </span>
          </button>
        ))}

        <div
          className="rounded-lg px-3 py-2.5"
          style={{ background: "var(--bg-raised)", border: `1px solid ${waterHit ? "var(--accent)" : "var(--line)"}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Water intake</span>
            <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">
              {log.water_ml} / {log.water_goal_ml}ml
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "var(--line)" }}>
            <div className="h-full rounded-full" style={{ width: `${waterPct}%`, background: "var(--accent)" }} />
          </div>
          <div className="flex gap-2">
            {WATER_STEPS.map((ml) => (
              <button key={ml} onClick={() => addWater(ml)} className="btn-ghost rounded-full px-3 py-1 text-xs">
                +{ml}ml
              </button>
            ))}
            <button onClick={() => addWater(-log.water_ml)} className="btn-ghost rounded-full px-3 py-1 text-xs ml-auto">
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-5">
        <div className="flex-1 min-w-[160px]">
          <p className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand mb-1.5">
            Weight today
          </p>
          <div className="flex gap-2">
            <input
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onBlur={saveWeight}
              onKeyDown={(e) => e.key === "Enter" && saveWeight()}
              placeholder="kg"
              className="w-24 rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          {recentWeights.length > 0 && (
            <p className="text-xs text-[color:var(--ink-faint)] mt-2">
              {recentWeights.map((w) => `${w.weight_kg}kg`).join(" · ")}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand mb-1.5">
          How did your day go?
        </p>
        <textarea
          value={notesInput}
          onChange={(e) => setNotesInput(e.target.value)}
          onBlur={saveNotes}
          placeholder="Notes on energy, sleep, cravings, anything worth remembering…"
          className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none"
          style={{ ...inputStyle, minHeight: "72px" }}
        />
      </div>
    </div>
  );
}
