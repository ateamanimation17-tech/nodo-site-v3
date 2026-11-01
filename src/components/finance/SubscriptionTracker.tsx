"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { formatEUR } from "@/lib/currency";

type Cycle = "monthly" | "yearly";
type Subscription = { id: string; name: string; amount: number; billing_cycle: Cycle; next_billing_date: string };

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysUntil(dateStr: string) {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date(todayStr() + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

function advancedDate(dateStr: string, cycle: Cycle) {
  const d = new Date(dateStr + "T00:00:00");
  if (cycle === "monthly") d.setMonth(d.getMonth() + 1);
  else d.setFullYear(d.getFullYear() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function SubscriptionTracker() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [nextDate, setNextDate] = useState(todayStr());

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
      .from("subscriptions")
      .select("id, name, amount, billing_cycle, next_billing_date")
      .eq("user_id", user.id)
      .order("next_billing_date", { ascending: true });
    setSubs((data as Subscription[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function addSub() {
    const value = parseFloat(amount);
    if (!name.trim() || Number.isNaN(value) || !nextDate) return;
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("subscriptions")
      .insert({ user_id: user.id, name: name.trim(), amount: value, billing_cycle: cycle, next_billing_date: nextDate })
      .select("id, name, amount, billing_cycle, next_billing_date")
      .single();

    if (!error && data) {
      const next = [...subs, data as Subscription].sort((a, b) => a.next_billing_date.localeCompare(b.next_billing_date));
      setSubs(next);
      setName("");
      setAmount("");
      setNextDate(todayStr());
      setShowAdd(false);
    }
  }

  async function advanceSub(sub: Subscription) {
    const updated = advancedDate(sub.next_billing_date, sub.billing_cycle);
    const supabase = getSupabaseClient();
    await supabase.from("subscriptions").update({ next_billing_date: updated }).eq("id", sub.id);
    setSubs((prev) =>
      prev
        .map((s) => (s.id === sub.id ? { ...s, next_billing_date: updated } : s))
        .sort((a, b) => a.next_billing_date.localeCompare(b.next_billing_date))
    );
  }

  async function removeSub(id: string) {
    const supabase = getSupabaseClient();
    await supabase.from("subscriptions").delete().eq("id", id);
    setSubs((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-[color:var(--ink-faint)]">Loading…</p>
      </div>
    );
  }

  const monthlyTotal = subs.reduce((sum, s) => sum + (s.billing_cycle === "monthly" ? s.amount : s.amount / 12), 0);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <p className="eyebrow">Subscriptions</p>
        <button onClick={() => setShowAdd((v) => !v)} className="btn-ghost rounded-full px-4 py-2 text-xs">
          {showAdd ? "Cancel" : "Add subscription"}
        </button>
      </div>
      <p className="text-sm text-[color:var(--ink-faint)] font-mono-brand tabular mb-5">
        {formatEUR(monthlyTotal)}/month recurring
      </p>

      {showAdd && (
        <div className="rounded-xl p-4 mb-5 flex gap-2 flex-wrap" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name, e.g. Netflix"
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
          <select
            value={cycle}
            onChange={(e) => setCycle(e.target.value as Cycle)}
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          <button onClick={addSub} className="btn-ghost rounded-md px-4 py-2 text-xs">
            Add
          </button>
        </div>
      )}

      {subs.length === 0 ? (
        <p className="text-sm text-[color:var(--ink-faint)]">No subscriptions tracked yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {subs.map((s) => {
            const days = daysUntil(s.next_billing_date);
            const dueSoon = days <= 7;
            return (
              <div key={s.id} className="flex items-center justify-between text-sm py-2" style={{ borderBottom: "1px solid var(--line)" }}>
                <div className="min-w-0">
                  <p className="truncate">{s.name}</p>
                  <p className="text-xs font-mono-brand tabular" style={{ color: dueSoon ? "var(--ink)" : "var(--ink-faint)" }}>
                    {days < 0 ? "Overdue" : days === 0 ? "Due today" : `${days}d`} · {s.billing_cycle}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono-brand tabular">{formatEUR(s.amount)}</span>
                  {days <= 0 && (
                    <button onClick={() => advanceSub(s)} className="btn-ghost rounded-full px-2.5 py-1 text-[11px]">
                      Renewed
                    </button>
                  )}
                  <button onClick={() => removeSub(s.id)} className="btn-ghost rounded-full px-2 py-1 text-xs">
                    ✕
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
