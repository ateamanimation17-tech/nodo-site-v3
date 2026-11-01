"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type StepLog = { log_date: string; steps: number | null };

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const WEEKS_BACK = 8;
const MONTHS_BACK = 6;

type Row = { label: string; total: number; avgPerDay: number; daysLogged: number; daysInPeriod: number };

export default function StepsHistory() {
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"weekly" | "monthly">("weekly");

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
    const cutoff = toDateStr(daysAgo(MONTHS_BACK * 31));
    const { data } = await supabase
      .from("reset_daily_logs")
      .select("log_date, steps")
      .eq("user_id", user.id)
      .gte("log_date", cutoff)
      .not("steps", "is", null)
      .order("log_date", { ascending: true });
    setLogs((data as StepLog[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const weeklyRows = useMemo<Row[]>(() => {
    const rows: Row[] = [];
    for (let i = 0; i < WEEKS_BACK; i++) {
      const end = daysAgo(7 * i);
      const start = daysAgo(7 * i + 6);
      const endStr = toDateStr(end);
      const startStr = toDateStr(start);
      const inRange = logs.filter((l) => l.log_date >= startStr && l.log_date <= endStr && l.steps != null);
      const total = inRange.reduce((a, l) => a + (l.steps ?? 0), 0);
      const label =
        i === 0
          ? "This week"
          : i === 1
          ? "Last week"
          : `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      rows.push({
        label,
        total,
        avgPerDay: inRange.length ? Math.round(total / inRange.length) : 0,
        daysLogged: inRange.length,
        daysInPeriod: 7,
      });
    }
    return rows;
  }, [logs]);

  const monthlyRows = useMemo<Row[]>(() => {
    const rows: Row[] = [];
    const now = new Date();
    for (let i = 0; i < MONTHS_BACK; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      const inRange = logs.filter((l) => l.log_date.slice(0, 7) === key && l.steps != null);
      const total = inRange.reduce((a, l) => a + (l.steps ?? 0), 0);
      const daysInMonth = i === 0 ? now.getDate() : new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      rows.push({
        label: i === 0 ? "This month" : monthLabel(key),
        total,
        avgPerDay: inRange.length ? Math.round(total / inRange.length) : 0,
        daysLogged: inRange.length,
        daysInPeriod: daysInMonth,
      });
    }
    return rows;
  }, [logs]);

  const rows = view === "weekly" ? weeklyRows : monthlyRows;
  const thisPeriod = rows[0];

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
        <p className="eyebrow">Steps history</p>
        <div className="flex gap-2">
          <button
            onClick={() => setView("weekly")}
            className="btn-ghost rounded-full px-3 py-1 text-xs"
            style={view === "weekly" ? { background: "var(--line)" } : undefined}
          >
            Weekly
          </button>
          <button
            onClick={() => setView("monthly")}
            className="btn-ghost rounded-full px-3 py-1 text-xs"
            style={view === "monthly" ? { background: "var(--line)" } : undefined}
          >
            Monthly
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="text-sm text-[color:var(--ink-faint)]">
          Log your steps in the daily check-in above to start building your history here.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <StatTile label={thisPeriod.label} value={thisPeriod.total.toLocaleString()} sub="total steps" />
            <StatTile
              label="Average"
              value={thisPeriod.avgPerDay.toLocaleString()}
              sub={`per logged day (${thisPeriod.daysLogged}/${thisPeriod.daysInPeriod})`}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <th className="text-left py-2 text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand">
                    {view === "weekly" ? "Week" : "Month"}
                  </th>
                  <th className="text-right py-2 text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand">
                    Total
                  </th>
                  <th className="text-right py-2 text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand">
                    Avg/day
                  </th>
                  <th className="text-right py-2 text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand">
                    Logged
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td className="py-2 text-[color:var(--ink)]">{r.label}</td>
                    <td className="py-2 text-right font-mono-brand tabular">{r.total.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono-brand tabular text-[color:var(--ink-faint)]">
                      {r.daysLogged ? r.avgPerDay.toLocaleString() : "—"}
                    </td>
                    <td className="py-2 text-right font-mono-brand tabular text-[color:var(--ink-faint)]">
                      {r.daysLogged}/{r.daysInPeriod}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
      <p className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand mb-1.5">
        {label}
      </p>
      <p className="text-2xl font-mono-brand tabular text-[color:var(--ink)]">{value}</p>
      <p className="text-[11px] text-[color:var(--ink-faint)] mt-1">{sub}</p>
    </div>
  );
}
