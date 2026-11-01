"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Habit = {
  id: string;
  name: string;
  position: number;
};

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computeStreak(loggedDates: Set<string>, today: string): number {
  const cursor = new Date();
  if (!loggedDates.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (loggedDates.has(toDateStr(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function HabitsSection() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loggedByHabit, setLoggedByHabit] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState("");
  const [adding, setAdding] = useState(false);
  const today = toDateStr(new Date());

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

    const [{ data: habitRows }, { data: logRows }] = await Promise.all([
      supabase
        .from("habits")
        .select("id, name, position")
        .eq("user_id", user.id)
        .eq("archived", false)
        .order("position", { ascending: true }),
      supabase.from("habit_logs").select("habit_id, log_date").eq("user_id", user.id),
    ]);

    const byHabit: Record<string, Set<string>> = {};
    (logRows ?? []).forEach((row) => {
      if (!byHabit[row.habit_id]) byHabit[row.habit_id] = new Set();
      byHabit[row.habit_id].add(row.log_date);
    });

    setHabits(habitRows ?? []);
    setLoggedByHabit(byHabit);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function toggleToday(habit: Habit) {
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const isLogged = loggedByHabit[habit.id]?.has(today) ?? false;

    setLoggedByHabit((prev) => {
      const next = { ...prev };
      const set = new Set(next[habit.id] ?? []);
      if (isLogged) set.delete(today);
      else set.add(today);
      next[habit.id] = set;
      return next;
    });

    if (isLogged) {
      await supabase
        .from("habit_logs")
        .delete()
        .eq("user_id", user.id)
        .eq("habit_id", habit.id)
        .eq("log_date", today);
    } else {
      await supabase.from("habit_logs").insert({
        user_id: user.id,
        habit_id: habit.id,
        log_date: today,
      });
    }
  }

  async function addHabit(e: React.FormEvent) {
    e.preventDefault();
    const name = newHabit.trim();
    if (!name) return;
    setAdding(true);
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setAdding(false);
      return;
    }
    const { data, error } = await supabase
      .from("habits")
      .insert({ user_id: user.id, name, position: habits.length })
      .select("id, name, position")
      .single();
    if (!error && data) {
      setHabits((prev) => [...prev, data]);
      setNewHabit("");
    }
    setAdding(false);
  }

  async function removeHabit(habit: Habit) {
    setHabits((prev) => prev.filter((h) => h.id !== habit.id));
    const supabase = getSupabaseClient();
    await supabase.from("habits").update({ archived: true }).eq("id", habit.id);
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="eyebrow">Daily habits</p>
      </div>

      {loading ? (
        <p className="text-sm text-[color:var(--ink-faint)] mb-5">Loading…</p>
      ) : (
        <div className="flex flex-col gap-3 mb-5">
          {habits.length === 0 && (
            <p className="text-sm text-[color:var(--ink-faint)]">
              No habits yet — add your first one below.
            </p>
          )}
          {habits.map((habit) => {
            const isLogged = loggedByHabit[habit.id]?.has(today) ?? false;
            const streak = computeStreak(loggedByHabit[habit.id] ?? new Set(), today);
            return (
              <div
                key={habit.id}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
                style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}
              >
                <button
                  onClick={() => toggleToday(habit)}
                  aria-label={isLogged ? "Mark not done" : "Mark done"}
                  className="h-5 w-5 rounded-md shrink-0 flex items-center justify-center transition-colors"
                  style={{
                    background: isLogged ? "var(--green)" : "transparent",
                    border: `1.5px solid ${isLogged ? "var(--green)" : "var(--line-strong)"}`,
                  }}
                >
                  {isLogged && <span style={{ color: "#fff", fontSize: "12px", lineHeight: 1 }}>✓</span>}
                </button>
                <span className="flex-1 text-[15px]">{habit.name}</span>
                {streak > 0 && (
                  <span className="font-mono-brand text-xs tabular" style={{ color: "var(--green)" }}>
                    {streak}d streak
                  </span>
                )}
                <button
                  onClick={() => removeHabit(habit)}
                  aria-label="Remove habit"
                  className="text-xs text-[color:var(--ink-faint)] hover:text-[color:var(--ink)] transition-colors"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={addHabit} className="flex gap-2">
        <input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Add a habit…"
          className="flex-1 rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
        />
        <button
          type="submit"
          disabled={adding || !newHabit.trim()}
          className="btn-ghost rounded-lg px-4 py-2.5 text-sm disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}
