"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type AnxietyLog = { log_date: string; anxiety_level: number };
type ExposureRow = { status: string; completed_at: string | null };
type WorryRow = { resolved: boolean };
type SessionRow = { kind: "breathing" | "pmr"; created_at: string };

const CHART_WIDTH = 600;
const CHART_HEIGHT = 160;
const PAD_LEFT = 8;
const PAD_RIGHT = 44;
const PAD_TOP = 16;
const PAD_BOTTOM = 20;

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(n: number) {
  return new Date(Date.now() - n * DAY_MS);
}

export default function WeeklyProgress() {
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<AnxietyLog[]>([]);
  const [exposuresThisWeek, setExposuresThisWeek] = useState(0);
  const [worryStats, setWorryStats] = useState({ resolved: 0, total: 0 });
  const [sessionStats, setSessionStats] = useState({ breathing: 0, pmr: 0 });
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

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

    const cutoff30 = daysAgo(30).toISOString().slice(0, 10);
    const { data: logs } = await supabase
      .from("anxiety_daily_logs")
      .select("log_date, anxiety_level")
      .eq("user_id", user.id)
      .gte("log_date", cutoff30)
      .order("log_date", { ascending: true });
    setTrend((logs as AnxietyLog[]) ?? []);

    const { data: exposures } = await supabase
      .from("exposure_challenges")
      .select("status, completed_at")
      .eq("user_id", user.id)
      .eq("status", "completed");
    const weekCutoff = daysAgo(7);
    const exposureList = (exposures as ExposureRow[]) ?? [];
    setExposuresThisWeek(
      exposureList.filter((e) => e.completed_at && new Date(e.completed_at) >= weekCutoff).length
    );

    const { data: worries } = await supabase.from("worry_entries").select("resolved").eq("user_id", user.id);
    const worryList = (worries as WorryRow[]) ?? [];
    setWorryStats({ resolved: worryList.filter((w) => w.resolved).length, total: worryList.length });

    const { data: sessions } = await supabase
      .from("grounding_sessions")
      .select("kind, created_at")
      .eq("user_id", user.id)
      .gte("created_at", weekCutoff.toISOString());
    const sessionList = (sessions as SessionRow[]) ?? [];
    setSessionStats({
      breathing: sessionList.filter((s) => s.kind === "breathing").length,
      pmr: sessionList.filter((s) => s.kind === "pmr").length,
    });

    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const recentTrend = useMemo(() => trend.slice(-14), [trend]);

  const weekAverages = useMemo(() => {
    const thisWeekCutoff = daysAgo(7);
    const lastWeekCutoff = daysAgo(14);
    const thisWeek = trend.filter((t) => new Date(t.log_date) >= thisWeekCutoff);
    const lastWeek = trend.filter((t) => {
      const d = new Date(t.log_date);
      return d >= lastWeekCutoff && d < thisWeekCutoff;
    });
    const avg = (arr: AnxietyLog[]) => (arr.length ? arr.reduce((a, b) => a + b.anxiety_level, 0) / arr.length : null);
    return { thisWeek: avg(thisWeek), lastWeek: avg(lastWeek) };
  }, [trend]);

  const points = useMemo(() => {
    if (recentTrend.length === 0) return [];
    const innerW = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
    const innerH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
    return recentTrend.map((t, i) => {
      const x = recentTrend.length === 1 ? PAD_LEFT + innerW / 2 : PAD_LEFT + (i / (recentTrend.length - 1)) * innerW;
      const y = PAD_TOP + innerH - (t.anxiety_level / 10) * innerH;
      return { x, y, log: t };
    });
  }, [recentTrend]);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-[color:var(--ink-faint)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <p className="eyebrow mb-5">Weekly progress</p>

      {points.length < 2 ? (
        <p className="text-sm text-[color:var(--ink-faint)] mb-6">
          Log a few daily check-ins to see your anxiety trend here.
        </p>
      ) : (
        <div className="mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand">Anxiety, last {recentTrend.length} days</span>
            {weekAverages.thisWeek != null && weekAverages.lastWeek != null && (
              <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">
                {weekAverages.thisWeek.toFixed(1)} avg this week
                {weekAverages.thisWeek <= weekAverages.lastWeek
                  ? ` (↓ ${(weekAverages.lastWeek - weekAverages.thisWeek).toFixed(1)} vs last week)`
                  : ` (↑ ${(weekAverages.thisWeek - weekAverages.lastWeek).toFixed(1)} vs last week)`}
              </span>
            )}
          </div>
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="w-full"
            style={{ height: 160 }}
            onMouseLeave={() => setHoverIdx(null)}
          >
            {[0, 5, 10].map((v) => {
              const innerH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
              const y = PAD_TOP + innerH - (v / 10) * innerH;
              return (
                <line
                  key={v}
                  x1={PAD_LEFT}
                  x2={CHART_WIDTH - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="var(--line)"
                  strokeWidth={1}
                />
              );
            })}

            <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

            <rect
              x={PAD_LEFT}
              y={PAD_TOP}
              width={CHART_WIDTH - PAD_LEFT - PAD_RIGHT}
              height={CHART_HEIGHT - PAD_TOP - PAD_BOTTOM}
              fill="transparent"
              onMouseMove={(e) => {
                const svgEl = e.currentTarget.ownerSVGElement;
                if (!svgEl) return;
                const rect = svgEl.getBoundingClientRect();
                const relX = ((e.clientX - rect.left) / rect.width) * CHART_WIDTH;
                let nearest = 0;
                let best = Infinity;
                points.forEach((p, i) => {
                  const d = Math.abs(p.x - relX);
                  if (d < best) {
                    best = d;
                    nearest = i;
                  }
                });
                setHoverIdx(nearest);
              }}
            />

            {hoverIdx != null && points[hoverIdx] && (
              <line
                x1={points[hoverIdx].x}
                x2={points[hoverIdx].x}
                y1={PAD_TOP}
                y2={CHART_HEIGHT - PAD_BOTTOM}
                stroke="var(--line-strong)"
                strokeWidth={1}
              />
            )}

            {points.map((p, i) => (
              <circle
                key={`dot-${p.log.log_date}`}
                cx={p.x}
                cy={p.y}
                r={i === points.length - 1 || i === hoverIdx ? 4 : 0}
                fill="var(--accent)"
              />
            ))}

            <text
              x={CHART_WIDTH - PAD_RIGHT + 8}
              y={points[points.length - 1].y}
              dominantBaseline="middle"
              fontSize={12}
              fill="var(--ink)"
              className="font-mono-brand tabular"
            >
              {points[points.length - 1].log.anxiety_level}
            </text>

            {hoverIdx != null && points[hoverIdx] && (
              <g>
                <rect
                  x={Math.min(Math.max(points[hoverIdx].x - 34, PAD_LEFT), CHART_WIDTH - PAD_RIGHT - 68)}
                  y={2}
                  width={68}
                  height={16}
                  rx={4}
                  fill="var(--bg-raised)"
                  stroke="var(--line-strong)"
                />
                <text
                  x={Math.min(Math.max(points[hoverIdx].x - 34, PAD_LEFT), CHART_WIDTH - PAD_RIGHT - 68) + 34}
                  y={10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                  fill="var(--ink)"
                  className="font-mono-brand tabular"
                >
                  {points[hoverIdx].log.log_date.slice(5)} · {points[hoverIdx].log.anxiety_level}
                </text>
              </g>
            )}
          </svg>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatTile label="Exposures completed" value={String(exposuresThisWeek)} sub="this week" />
        <StatTile
          label="Worries resolved"
          value={`${worryStats.resolved} / ${worryStats.total}`}
          sub="all time"
        />
        <StatTile
          label="Grounding sessions"
          value={String(sessionStats.breathing + sessionStats.pmr)}
          sub={`${sessionStats.breathing} breathing · ${sessionStats.pmr} PMR, this week`}
        />
      </div>
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
