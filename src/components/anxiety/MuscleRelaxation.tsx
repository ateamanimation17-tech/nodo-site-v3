"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Phase = "tense" | "release";

const TENSE_SECONDS = 5;
const RELEASE_SECONDS = 10;
const PHASE_LABEL: Record<Phase, string> = { tense: "Tense", release: "Release" };

const MUSCLE_GROUPS = [
  "Hands & forearms",
  "Upper arms",
  "Shoulders",
  "Face",
  "Chest & back",
  "Stomach",
  "Thighs",
  "Calves & feet",
];

async function logSession() {
  const supabase = getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("grounding_sessions").insert({ user_id: user.id, kind: "pmr" });
}

export default function MuscleRelaxation() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("tense");
  const [secondsLeft, setSecondsLeft] = useState(TENSE_SECONDS);
  const groupIndexRef = useRef(0);
  const phaseRef = useRef<Phase>("tense");

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;

        if (phaseRef.current === "tense") {
          phaseRef.current = "release";
          setPhase("release");
          return RELEASE_SECONDS;
        }

        const next = groupIndexRef.current + 1;
        if (next >= MUSCLE_GROUPS.length) {
          setRunning(false);
          setDone(true);
          logSession();
          return TENSE_SECONDS;
        }
        groupIndexRef.current = next;
        phaseRef.current = "tense";
        setGroupIndex(next);
        setPhase("tense");
        return TENSE_SECONDS;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function start() {
    groupIndexRef.current = 0;
    phaseRef.current = "tense";
    setGroupIndex(0);
    setPhase("tense");
    setSecondsLeft(TENSE_SECONDS);
    setDone(false);
    setRunning(true);
  }

  function stop() {
    setRunning(false);
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="eyebrow">Progressive muscle relaxation</p>
        {running && (
          <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">
            {groupIndex + 1} / {MUSCLE_GROUPS.length}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center py-6">
        <div
          className="rounded-full flex items-center justify-center mb-6"
          style={{
            width: 160,
            height: 160,
            background: "var(--bg-raised)",
            border: "1px solid var(--line-strong)",
            transform: `scale(${running && phase === "tense" ? 1.08 : 1})`,
            transition: "transform 1s ease-in-out",
          }}
        >
          <div className="text-center px-4">
            {running ? (
              <>
                <p className="text-sm text-[color:var(--ink)]">{MUSCLE_GROUPS[groupIndex]}</p>
                <p className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular mt-1">
                  {PHASE_LABEL[phase]} · {secondsLeft}
                </p>
              </>
            ) : done ? (
              <p className="text-sm text-[color:var(--ink)]">Done</p>
            ) : (
              <p className="text-sm text-[color:var(--ink)]">Ready</p>
            )}
          </div>
        </div>

        {running ? (
          <button onClick={stop} className="btn-ghost rounded-full px-5 py-2 text-xs">
            Stop
          </button>
        ) : (
          <button onClick={start} className="btn-ghost rounded-full px-5 py-2 text-xs">
            {done ? "Go again" : "Start muscle relaxation"}
          </button>
        )}
      </div>

      {!running && (
        <div className="flex flex-wrap gap-1.5 justify-center mb-4">
          {MUSCLE_GROUPS.map((g, i) => (
            <span
              key={g}
              className="text-[10px] px-2 py-1 rounded-full font-mono-brand"
              style={{
                background: done || i < groupIndex ? "var(--line)" : "var(--bg-raised)",
                border: "1px solid var(--line)",
                color: "var(--ink-faint)",
              }}
            >
              {g}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-[color:var(--ink-faint)] text-center">
        Work through each muscle group: tense it for 5 seconds, then let go and notice the release for 10 seconds
        before moving on.
      </p>
      <p className="text-[11px] text-[color:var(--ink-faint)] text-center mt-3">
        This is a general stress tool, not a substitute for professional care. If you&apos;re in crisis or need
        urgent support, please contact a mental health professional or your local emergency services.
      </p>
    </div>
  );
}
