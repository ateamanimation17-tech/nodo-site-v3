"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { formatEUR } from "@/lib/currency";

type Income = { id: string; source: string; amount: number; received_date: string };

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const SOURCE_PRESETS = ["Salary", "Freelance", "Gift", "Refund", "Other"];

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthBounds(year: number, month: number) {
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export default function IncomeTracker() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [entries, setEntries] = useState<Income[]>([]);
  const [expensesTotal, setExpensesTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [receivedDate, setReceivedDate] = useState(todayStr());

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
    const { start, end } = monthBounds(year, month);

    const { data: income } = await supabase
      .from("income_entries")
      .select("id, source, amount, received_date")
      .eq("user_id", user.id)
      .gte("received_date", start)
      .lte("received_date", end)
      .order("received_date", { ascending: false });
    setEntries((income as Income[]) ?? []);

    const { data: expenses } = await supabase
      .from("budget_expenses")
      .select("amount")
      .eq("user_id", user.id)
      .gte("spent_date", start)
      .lte("spent_date", end);
    setExpensesTotal(((expenses as { amount: number }[]) ?? []).reduce((sum, e) => sum + e.amount, 0));

    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  async function addIncome() {
    const value = parseFloat(amount);
    if (!source.trim() || Number.isNaN(value) || !receivedDate) return;
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("income_entries")
      .insert({ user_id: user.id, source: source.trim(), amount: value, received_date: receivedDate })
      .select("id, source, amount, received_date")
      .single();

    if (!error && data) {
      const inRange = receivedDate >= monthBounds(year, month).start && receivedDate <= monthBounds(year, month).end;
      if (inRange) {
        setEntries((prev) => [data as Income, ...prev].sort((a, b) => b.received_date.localeCompare(a.received_date)));
      }
      setSource("");
      setAmount("");
      setReceivedDate(todayStr());
      setShowAdd(false);
    }
  }

  async function removeIncome(id: string) {
    const supabase = getSupabaseClient();
    await supabase.from("income_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-[color:var(--ink-faint)]">Loading…</p>
      </div>
    );
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const incomeTotal = entries.reduce((sum, e) => sum + e.amount, 0);
  const net = incomeTotal - expensesTotal;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <p className="eyebrow">Income</p>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftMonth(-1)} className="btn-ghost rounded-full px-3 py-1.5 text-xs">
            ←
          </button>
          <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand min-w-[90px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={() => shiftMonth(1)} disabled={isCurrentMonth} className="btn-ghost rounded-full px-3 py-1.5 text-xs disabled:opacity-40">
            →
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
        <div>
          <p className="font-display text-3xl tabular">{formatEUR(incomeTotal)}</p>
          <p className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">received this month</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium tabular" style={{ color: net >= 0 ? "var(--ink)" : "#e08a8a" }}>
            {net >= 0 ? "+" : ""}{formatEUR(net)}
          </p>
          <p className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">net this month</p>
        </div>
      </div>

      <div className="mb-5">
        <button onClick={() => setShowAdd((v) => !v)} className="btn-ghost rounded-full px-4 py-2 text-xs">
          {showAdd ? "Cancel" : "Add money"}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl p-4 mb-5 flex flex-col gap-3" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
          <div className="flex gap-2 flex-wrap">
            {SOURCE_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setSource(p)}
                className="btn-ghost rounded-full px-3 py-1 text-xs"
                style={source === p ? { background: "var(--line)" } : undefined}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Source, e.g. Salary"
              className="flex-1 min-w-[140px] rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (€)"
              className="w-28 rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
            <input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
            <button onClick={addIncome} className="btn-ghost rounded-md px-4 py-2 text-xs">
              Add
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-[color:var(--ink-faint)]">No income logged for this month yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between text-sm py-1.5" style={{ borderBottom: "1px solid var(--line)" }}>
              <div className="min-w-0">
                <p className="truncate">{e.source}</p>
                <p className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">{e.received_date}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono-brand tabular">{formatEUR(e.amount)}</span>
                <button onClick={() => removeIncome(e.id)} className="btn-ghost rounded-full px-2 py-1 text-xs">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
