"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

const PRESETS = [
  { label: "25 / 5", focus: 25, breakMin: 5 },
  { label: "50 / 10", focus: 50, breakMin: 10 },
  { label: "15 / 3", focus: 15, breakMin: 3 },
];

type Mode = "focus" | "break";

export default function FocusTimer() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [customFocus, setCustomFocus] = useState("");
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[0].focus * 60);
  const [running, setRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const preset = PRESETS[presetIndex];
  const focusMinutes = customFocus.trim()
    ? Math.max(1, parseInt(customFocus, 10) || preset.focus)
    : preset.focus;

  function resetTo(nextMode: Mode) {
    setMode(nextMode);
    const minutes = nextMode === "focus" ? focusMinutes : preset.breakMin;
    setSecondsLeft(minutes * 60);
    setRunning(false);
  }

  async function logSession(minutes: number) {
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("focus_sessions").insert({ user_id: user.id, minutes });
    setSessionsToday((n) => (n ?? 0) + 1);
  }

  async function handleComplete() {
    setRunning(false);
    if (mode === "focus") {
      await logSession(focusMinutes);
      resetTo("break");
    } else {
      resetTo("focus");
    }
  }

  async function loadSessionsToday() {
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("focus_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("completed_at", start.toISOString());
    setSessionsToday(count ?? 0);
  }

  function start() {
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSessionsToday();
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          handleComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const atStart = secondsLeft === (mode === "focus" ? focusMinutes : preset.breakMin) * 60;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="eyebrow">Focus timer</p>
        {sessionsToday !== null && (
          <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">
            {sessionsToday} session{sessionsToday === 1 ? "" : "s"} today
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-5">
        <p
          className="font-display tabular"
          style={{ fontSize: "3.2rem", lineHeight: 1, color: mode === "focus" ? "var(--ink)" : "var(--green)" }}
        >
          {mm}:{ss}
        </p>
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-faint)] font-mono-brand">
          {mode === "focus" ? "Focus" : "Break"}
        </p>

        <div className="flex gap-2 flex-wrap justify-center">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => {
                setPresetIndex(i);
                setCustomFocus("");
                if (!running) resetTo("focus");
              }}
              className="rounded-full px-3.5 py-1.5 text-xs transition-colors"
              style={{
                border: `1px solid ${i === presetIndex ? "var(--accent)" : "var(--line-strong)"}`,
                color: i === presetIndex ? "var(--ink)" : "var(--ink-dim)",
              }}
            >
              {p.label}
            </button>
          ))}
          <input
            value={customFocus}
            onChange={(e) => setCustomFocus(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={() => {
              if (customFocus.trim() && !running) resetTo("focus");
            }}
            placeholder="Custom min"
            className="w-24 rounded-full px-3.5 py-1.5 text-xs outline-none text-center"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
          />
        </div>

        <div className="flex gap-3">
          {running ? (
            <button onClick={pause} className="btn-ghost rounded-full px-6 py-2.5 text-sm">
              Pause
            </button>
          ) : (
            <button onClick={start} className="btn-accent rounded-full px-6 py-2.5 text-sm">
              {atStart ? "Start" : "Resume"}
            </button>
          )}
          <button onClick={() => resetTo("focus")} className="btn-ghost rounded-full px-6 py-2.5 text-sm">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
