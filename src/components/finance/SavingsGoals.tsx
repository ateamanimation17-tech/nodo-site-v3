"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { formatEUR } from "@/lib/currency";

type Goal = { id: string; name: string; target_amount: number; current_amount: number; target_date: string | null };
type Pace = { dailyRate: number; source: "trend" | "month" | "none" };
type TopCategory = { name: string; amount: number } | null;

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };
const CONTRIBUTION_STEPS = [25, 100];

function daysUntil(dateStr: string) {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

function monthStart(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

export default function SavingsGoals({ refreshKey }: { refreshKey?: number } = {}) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [pace, setPace] = useState<Pace>({ dailyRate: 0, source: "none" });
  const [topCategory, setTopCategory] = useState<TopCategory>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

  // How much the user is actually saving per day on average — prefers the
  // real net-worth trend (it already reflects all spending & income); falls
  // back to this month's income minus expenses so far when there isn't
  // enough history yet.
  async function loadPace(userId: string) {
    const supabase = getSupabaseClient();
    const { data: history } = await supabase
      .from("net_worth_snapshots")
      .select("snapshot_date, net_worth")
      .eq("user_id", userId)
      .order("snapshot_date", { ascending: true })
      .limit(90);
    const points = (history as { snapshot_date: string; net_worth: number }[]) ?? [];

    if (points.length >= 2) {
      const first = points[0];
      const last = points[points.length - 1];
      const spanDays = Math.round(
        (new Date(last.snapshot_date).getTime() - new Date(first.snapshot_date).getTime()) / (24 * 60 * 60 * 1000)
      );
      if (spanDays >= 3) {
        setPace({ dailyRate: (last.net_worth - first.net_worth) / spanDays, source: "trend" });
        return;
      }
    }

    const now = new Date();
    const start = monthStart(now.getFullYear(), now.getMonth());
    const [{ data: income }, { data: expenses }] = await Promise.all([
      supabase.from("income_entries").select("amount").eq("user_id", userId).gte("received_date", start),
      supabase.from("budget_expenses").select("amount").eq("user_id", userId).gte("spent_date", start),
    ]);
    const incomeSum = ((income as { amount: number }[]) ?? []).reduce((s, e) => s + e.amount, 0);
    const expenseSum = ((expenses as { amount: number }[]) ?? []).reduce((s, e) => s + e.amount, 0);

    if (incomeSum === 0 && expenseSum === 0) {
      setPace({ dailyRate: 0, source: "none" });
      return;
    }
    const daysElapsed = Math.max(now.getDate(), 1);
    setPace({ dailyRate: (incomeSum - expenseSum) / daysElapsed, source: "month" });
  }

  // This month's biggest spending category — turns "you're short" into a
  // concrete, actionable tip instead of a generic nudge.
  async function loadTopCategory(userId: string) {
    const supabase = getSupabaseClient();
    const now = new Date();
    const start = monthStart(now.getFullYear(), now.getMonth());

    const [{ data: cats }, { data: exp }] = await Promise.all([
      supabase.from("budget_categories").select("id, name").eq("user_id", userId),
      supabase.from("budget_expenses").select("category_id, amount").eq("user_id", userId).gte("spent_date", start),
    ]);
    const categories = (cats as { id: string; name: string }[]) ?? [];
    const expenses = (exp as { category_id: string; amount: number }[]) ?? [];

    const totals: Record<string, number> = {};
    for (const e of expenses) totals[e.category_id] = (totals[e.category_id] ?? 0) + e.amount;

    let best: TopCategory = null;
    for (const c of categories) {
      const amount = totals[c.id] ?? 0;
      if (amount > 0 && (!best || amount > best.amount)) best = { name: c.name, amount };
    }
    setTopCategory(best);
  }

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

    await Promise.all([loadPace(user.id), loadTopCategory(user.id)]);

    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

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

                <GoalPlan goal={g} pace={pace} topCategory={topCategory} />

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

function GoalPlan({ goal, pace, topCategory }: { goal: Goal; pace: Pace; topCategory: TopCategory }) {
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);

  if (remaining <= 0) {
    return <p className="text-xs text-[color:var(--ink-faint)] mb-3">Goal reached — nice work.</p>;
  }

  const weeklyPace = pace.dailyRate * 7;

  if (!goal.target_date) {
    if (pace.source !== "none" && weeklyPace > 0) {
      const weeksEstimate = Math.max(1, Math.ceil(remaining / weeklyPace));
      return (
        <p className="text-xs text-[color:var(--ink-faint)] mb-3">
          At your current pace (~{formatEUR(weeklyPace)}/week), this would take about {weeksEstimate}{" "}
          {weeksEstimate === 1 ? "week" : "weeks"}. Add a target date for a day-by-day plan.
        </p>
      );
    }
    return <p className="text-xs text-[color:var(--ink-faint)] mb-3">Add a target date to see how much to save per week.</p>;
  }

  const days = daysUntil(goal.target_date);
  if (days <= 0) {
    return <p className="text-xs text-[color:var(--ink-faint)] mb-3">Target date has passed — push it out or add more now.</p>;
  }

  const weeklyNeeded = remaining / (days / 7);
  const dailyNeeded = remaining / days;
  const onTrack = pace.source !== "none" && weeklyPace >= weeklyNeeded;
  const weeklyGap = Math.max(weeklyNeeded - weeklyPace, 0);
  const monthlyGap = weeklyGap * 4.345;
  const cut = topCategory ? topCategory.amount * 0.15 : 0;
  const coveragePct = topCategory && monthlyGap > 0 ? Math.min(100, Math.round((cut / monthlyGap) * 100)) : 0;

  return (
    <div className="mb-3 flex flex-col gap-1">
      <p className="text-xs text-[color:var(--ink-faint)]">
        Save <span className="font-mono-brand tabular text-[color:var(--ink)]">{formatEUR(weeklyNeeded)}</span>/week (
        <span className="font-mono-brand tabular text-[color:var(--ink)]">{formatEUR(dailyNeeded)}</span>/day) to get there in time.
      </p>
      {pace.source !== "none" && (
        <p className="text-xs" style={{ color: onTrack ? "var(--ink-faint)" : "#e08a8a" }}>
          {weeklyPace > 0
            ? onTrack
              ? `You're saving about ${formatEUR(weeklyPace)}/week on average — on pace.`
              : `You're saving about ${formatEUR(weeklyPace)}/week on average — ${formatEUR(weeklyGap)}/week short.`
            : `You're currently spending more than you earn (about ${formatEUR(Math.abs(weeklyPace))}/week) — closing that gap comes first.`}
        </p>
      )}
      {!onTrack && topCategory && coveragePct > 0 && (
        <p className="text-xs text-[color:var(--ink-faint)]">
          Tip: {topCategory.name} is your biggest expense this month at {formatEUR(topCategory.amount)}/mo — trimming it by 15% (~
          {formatEUR(cut)}/mo) would cover about {coveragePct}% of the gap.
        </p>
      )}
    </div>
  );
}
