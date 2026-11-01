"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { formatEUR } from "@/lib/currency";

type Goal = { id: string; name: string; target_amount: number; current_amount: number; target_date: string | null };

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };
const CONTRIBUTION_STEPS = [25, 100];

function daysUntil(dateStr: string) {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

export default function SavingsGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

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
      .from("savings_goals")
      .select("id, name, target_amount, current_amount, target_date")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setGoals((data as Goal[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function addGoal() {
    const value = parseFloat(target);
    if (!name.trim() || Number.isNaN(value)) return;
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("savings_goals")
      .insert({
        user_id: user.id,
        name: name.trim(),
        target_amount: value,
        current_amount: 0,
        target_date: targetDate || null,
      })
      .select("id, name, target_amount, current_amount, target_date")
      .single();

    if (!error && data) {
      setGoals((prev) => [...prev, data as Goal]);
      setName("");
      setTarget("");
      setTargetDate("");
      setShowAdd(false);
    }
  }

  async function contribute(goal: Goal, amount: number) {
    if (!amount) return;
    const nextAmount = Math.max(goal.current_amount + amount, 0);
    const supabase = getSupabaseClient();
    await supabase.from("savings_goals").update({ current_amount: nextAmount }).eq("id", goal.id);
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, current_amount: nextAmount } : g)));
  }

  async function removeGoal(id: string) {
    const supabase = getSupabaseClient();
    await supabase.from("savings_goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
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
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="eyebrow">Savings goals</p>
        <button onClick={() => setShowAdd((v) => !v)} className="btn-ghost rounded-full px-4 py-2 text-xs">
          {showAdd ? "Cancel" : "Add goal"}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl p-4 mb-5 flex gap-2 flex-wrap" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Goal, e.g. Emergency fund"
            className="flex-1 min-w-[140px] rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target (€)"
            className="w-28 rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          <button onClick={addGoal} className="btn-ghost rounded-md px-4 py-2 text-xs">
            Add
          </button>
        </div>
      )}

      {goals.length === 0 ? (
        <p className="text-sm text-[color:var(--ink-faint)]">No goals yet — add one to start saving toward it.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map((g) => {
            const pct = g.target_amount > 0 ? Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100) : 0;
            const days = g.target_date ? daysUntil(g.target_date) : null;
            return (
              <div key={g.id} className="rounded-xl p-4" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium truncate">{g.name}</p>
                    {days != null && (
                      <p className="text-xs text-[color:var(--ink-faint)]">
                        {days < 0 ? "Past target date" : days === 0 ? "Due today" : `${days} days left`}
                      </p>
                    )}
                  </div>
                  <button onClick={() => removeGoal(g.id)} className="btn-ghost rounded-full px-2 py-1 text-xs shrink-0">
                    ✕
                  </button>
                </div>
                <p className="text-xs font-mono-brand tabular text-[color:var(--ink-faint)] mb-2">
                  {formatEUR(g.current_amount)} / {formatEUR(g.target_amount)} · {pct}%
                </p>
                <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "var(--line)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--accent)" }} />
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  {CONTRIBUTION_STEPS.map((amt) => (
                    <button key={amt} onClick={() => contribute(g, amt)} className="btn-ghost rounded-full px-3 py-1 text-xs">
                      +{formatEUR(amt)}
                    </button>
                  ))}
                  <input
                    value={customAmounts[g.id] ?? ""}
                    onChange={(e) => setCustomAmounts((prev) => ({ ...prev, [g.id]: e.target.value }))}
                    placeholder="Custom €"
                    className="w-24 rounded-md px-2 py-1 text-xs outline-none"
                    style={inputStyle}
                  />
                  <button
                    onClick={() => {
                      const amt = parseFloat(customAmounts[g.id] ?? "");
                      if (!Number.isNaN(amt)) {
                        contribute(g, amt);
                        setCustomAmounts((prev) => ({ ...prev, [g.id]: "" }));
                      }
                    }}
                    className="btn-ghost rounded-full px-3 py-1 text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
