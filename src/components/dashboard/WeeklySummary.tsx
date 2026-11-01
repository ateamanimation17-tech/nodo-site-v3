import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { formatEUR } from "@/lib/currency";

const RESET_HABIT_KEYS = [
  "steps_10k",
  "no_vices",
  "supplements",
  "gym_session",
  "cardio",
  "mindset_minutes",
] as const;

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

type Tone = "good" | "bad" | "neutral";

type Tile = {
  label: string;
  value: string;
  sub: string;
  tone: Tone;
};

export default async function WeeklySummary({ userId }: { userId: string }) {
  const supabase = await getSupabaseServerClient();
  const now = new Date();
  const weekAgoDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const weekAgo = toDateStr(weekAgoDate);
  const weekAgoIso = weekAgoDate.toISOString();

  const [
    { data: latestSnap },
    { data: priorSnap },
    { data: resetLogs },
    { data: habits },
    { data: habitLogs },
    { data: anxietyLogs },
    { data: groundingSessions },
  ] = await Promise.all([
    supabase
      .from("net_worth_snapshots")
      .select("snapshot_date, net_worth")
      .eq("user_id", userId)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("net_worth_snapshots")
      .select("snapshot_date, net_worth")
      .eq("user_id", userId)
      .lte("snapshot_date", weekAgo)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("reset_daily_logs")
      .select(
        "log_date, steps, steps_10k, no_vices, supplements, gym_session, cardio, mindset_minutes"
      )
      .eq("user_id", userId)
      .gte("log_date", weekAgo),
    supabase.from("habits").select("id").eq("user_id", userId).eq("archived", false),
    supabase
      .from("habit_logs")
      .select("log_date")
      .eq("user_id", userId)
      .gte("log_date", weekAgo),
    supabase
      .from("anxiety_daily_logs")
      .select("log_date, anxiety_level")
      .eq("user_id", userId)
      .gte("log_date", weekAgo),
    supabase
      .from("grounding_sessions")
      .select("kind")
      .eq("user_id", userId)
      .gte("created_at", weekAgoIso),
  ]);

  // Finances Management — net worth change over the last 7 days.
  const netWorthChange =
    latestSnap && priorSnap ? latestSnap.net_worth - priorSnap.net_worth : null;

  // The Nodo Reset Method — average steps logged + habit hit rate.
  const resetLogRows: Array<Record<string, unknown>> = resetLogs ?? [];
  const stepsLogged = resetLogRows.filter((r) => typeof r.steps === "number");
  const avgSteps = stepsLogged.length
    ? Math.round(
        stepsLogged.reduce((sum, r) => sum + (r.steps as number), 0) / stepsLogged.length
      )
    : null;
  const resetHabitsDone = resetLogRows.reduce(
    (sum, r) => sum + RESET_HABIT_KEYS.filter((k) => r[k]).length,
    0
  );
  const resetHabitPct = resetLogRows.length
    ? Math.round((resetHabitsDone / (resetLogRows.length * RESET_HABIT_KEYS.length)) * 100)
    : null;

  // Projects Management — habit completion rate across the week.
  const activeHabitCount = (habits ?? []).length;
  const habitCompletionPct =
    activeHabitCount > 0
      ? Math.min(100, Math.round(((habitLogs ?? []).length / (activeHabitCount * 7)) * 100))
      : null;

  // Anxiety Control — average anxiety level + grounding sessions.
  const anxietyLevels = (anxietyLogs ?? [])
    .map((r) => r.anxiety_level)
    .filter((v): v is number => typeof v === "number");
  const avgAnxiety = anxietyLevels.length
    ? Math.round((anxietyLevels.reduce((s, v) => s + v, 0) / anxietyLevels.length) * 10) / 10
    : null;
  const sessionCount = (groundingSessions ?? []).length;

  const tiles: Tile[] = [
    {
      label: "Finances Management",
      value: netWorthChange === null ? "—" : `${netWorthChange >= 0 ? "+" : ""}${formatEUR(netWorthChange)}`,
      sub: netWorthChange === null ? "Log a snapshot to start tracking" : "net worth, past 7 days",
      tone: netWorthChange === null ? "neutral" : netWorthChange >= 0 ? "good" : "bad",
    },
    {
      label: "The Nodo Reset Method",
      value: avgSteps === null ? "—" : avgSteps.toLocaleString("en-US"),
      sub:
        avgSteps === null
          ? "No check-ins yet this week"
          : `avg steps/day · ${resetHabitPct ?? 0}% habits hit`,
      tone: "neutral",
    },
    {
      label: "Projects Management",
      value: habitCompletionPct === null ? "—" : `${habitCompletionPct}%`,
      sub: activeHabitCount === 0 ? "Add a habit to start tracking" : "habit completion this week",
      tone: "neutral",
    },
    {
      label: "Anxiety Control",
      value: avgAnxiety === null ? "—" : `${avgAnxiety}/10`,
      sub:
        avgAnxiety === null
          ? "No check-ins yet this week"
          : `avg anxiety · ${sessionCount} grounding session${sessionCount === 1 ? "" : "s"}`,
      tone: "neutral",
    },
  ];

  return (
    <div className="mb-10">
      <p className="eyebrow mb-3">This week</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="card p-5 flex flex-col gap-1.5">
            <p className="font-mono-brand text-xs tracking-[0.15em] text-[color:var(--ink-faint)] uppercase">
              {t.label}
            </p>
            <p
              className="font-display text-2xl tabular"
              style={{
                color:
                  t.tone === "good"
                    ? "var(--green)"
                    : t.tone === "bad"
                      ? "#e5787c"
                      : "var(--ink)",
              }}
            >
              {t.value}
            </p>
            <p className="text-xs text-[color:var(--ink-dim)] leading-relaxed">{t.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
