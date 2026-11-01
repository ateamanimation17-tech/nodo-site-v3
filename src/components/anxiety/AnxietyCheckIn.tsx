"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type HabitKey = "steps_10k" | "no_vices" | "supplements" | "gym_session" | "cardio" | "mindset_minutes";

const HABITS: { key: HabitKey; label: string }[] = [
  { key: "steps_10k", label: "10k steps" },
  { key: "no_vices", label: "No vices" },
  { key: "supplements", label: "Supplements" },
  { key: "gym_session", label: "Gym session" },
  { key: "cardio", label: "Cardio" },
  { key: "mindset_minutes", label: "15 min mindset time" },
];

const MIN_BUCKET = 3;
const MIN_GAP = 0.5;

type DailyLog = { log_date: string; anxiety_level: number };
type ResetRow = { log_date: string } & Record<HabitKey, boolean>;
type Insight = { label: string; withTrue: number; withFalse: number; gap: number };

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AnxietyCheckIn() {
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("5");
  const [notes, setNotes] = useState("");
  const [todayLogged, setTodayLogged] = useState(false);
  const [recent, setRecent] = useState<DailyLog[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [saved, setSaved] = useState(false);

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

    const { data: logs } = await supabase
      .from("anxiety_daily_logs")
      .select("log_date, anxiety_level, notes")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(60);
    const logList = (logs as (DailyLog & { notes: string | null })[]) ?? [];
    setRecent(logList.slice(0, 14).reverse());

    const today = todayStr();
    const todayRow = logList.find((l) => l.log_date === today);
    if (todayRow) {
      setLevel(String(todayRow.anxiety_level));
      setNotes(todayRow.notes ?? "");
      setTodayLogged(true);
    }

    const { data: resetRows } = await supabase
      .from("reset_daily_logs")
      .select("log_date, steps_10k, no_vices, supplements, gym_session, cardio, mindset_minutes")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(90);
    const resetList = (resetRows as ResetRow[]) ?? [];
    const resetByDate = new Map(resetList.map((r) => [r.log_date, r]));

    const computed: Insight[] = [];
    for (const h of HABITS) {
      const withTrue: number[] = [];
      const withFalse: number[] = [];
      for (const log of logList) {
        const reset = resetByDate.get(log.log_date);
        if (!reset) continue;
        if (reset[h.key]) withTrue.push(log.anxiety_level);
        else withFalse.push(log.anxiety_level);
      }
      if (withTrue.length >= MIN_BUCKET && withFalse.length >= MIN_BUCKET) {
        const avgTrue = withTrue.reduce((a, b) => a + b, 0) / withTrue.length;
        const avgFalse = withFalse.reduce((a, b) => a + b, 0) / withFalse.length;
        computed.push({ label: h.label, withTrue: avgTrue, withFalse: avgFalse, gap: avgFalse - avgTrue });
      }
    }
    computed.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
    setInsights(computed.filter((c) => Math.abs(c.gap) >= MIN_GAP).slice(0, 3));

    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function save() {
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const value = Math.min(10, Math.max(0, parseInt(level, 10) || 0));
    const today = todayStr();
    await supabase
      .from("anxiety_daily_logs")
      .upsert(
        { user_id: user.id, log_date: today, anxiety_level: value, notes: notes.trim() || null },
        { onConflict: "user_id,log_date" }
      );

    setTodayLogged(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setRecent((prev) => {
      const withoutToday = prev.filter((l) => l.log_date !== today);
      return [...withoutToday, { log_date: today, anxiety_level: value }].slice(-14);
    });
  }

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-[color:var(--ink-faint)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <p className="eyebrow">Daily check-in</p>
        {todayLogged && <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand">Logged today</span>}
      </div>

      <p className="text-sm mb-3">How anxious do you feel today?</p>
      <div className="flex items-center gap-3 mb-3">
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="flex-1"
        />
        <span className="text-sm font-mono-brand tabular text-[color:var(--ink-faint)] w-8 text-right">{level}</span>
      </div>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What's driving it today? (optional)"
        className="w-full rounded-md px-3 py-2 text-sm outline-none mb-3"
        style={inputStyle}
      />
      <button onClick={save} className="btn-ghost rounded-full px-4 py-2 text-xs">
        {saved ? "Saved" : todayLogged ? "Update today" : "Log today"}
      </button>

      {recent.length >= 2 && (
        <div className="flex items-end gap-1 mt-6" style={{ height: 40 }}>
          {recent.map((l) => (
            <div
              key={l.log_date}
              title={`${l.log_date}: ${l.anxiety_level}`}
              className="flex-1 rounded-sm"
              style={{
                height: `${Math.max(8, (l.anxiety_level / 10) * 100)}%`,
                background: "var(--accent)",
                opacity: 0.25 + (l.anxiety_level / 10) * 0.6,
              }}
            />
          ))}
        </div>
      )}

      <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--line)" }}>
        <p className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand mb-3">
          Patterns with your Reset habits
        </p>
        {insights.length === 0 ? (
          <p className="text-xs text-[color:var(--ink-faint)]">
            Keep logging check-ins alongside your Reset habits — patterns will show up here once there&apos;s
            enough data.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {insights.map((i) => {
              const helps = i.gap > 0;
              return (
                <p key={i.label} className="text-xs text-[color:var(--ink-faint)]">
                  On days with <span className="text-[color:var(--ink)]">{i.label.toLowerCase()}</span>, your
                  anxiety averages {helps ? i.withTrue.toFixed(1) : i.withFalse.toFixed(1)} — vs{" "}
                  {helps ? i.withFalse.toFixed(1) : i.withTrue.toFixed(1)} on days without it.
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
