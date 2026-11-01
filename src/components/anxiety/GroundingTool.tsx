"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Phase = "inhale" | "hold1" | "exhale" | "hold2";

const PHASE_SECONDS = 4;
const PHASE_LABEL: Record<Phase, string> = {
  inhale: "Breathe in",
  hold1: "Hold",
  exhale: "Breathe out",
  hold2: "Hold",
};
const PHASE_ORDER: Phase[] = ["inhale", "hold1", "exhale", "hold2"];
const PHASE_SCALE: Record<Phase, number> = {
  inhale: 1,
  hold1: 1.35,
  exhale: 1.35,
  hold2: 1,
};

async function logSession() {
  const supabase = getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("grounding_sessions").insert({ user_id: user.id, kind: "breathing" });
}

export default function GroundingTool() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [secondsLeft, setSecondsLeft] = useState(PHASE_SECONDS);
  const [cycles, setCycles] = useState(0);
  const phaseIndexRef = useRef(0);
  const cyclesRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        phaseIndexRef.current = (phaseIndexRef.current + 1) % PHASE_ORDER.length;
        const nextPhase = PHASE_ORDER[phaseIndexRef.current];
        setPhase(nextPhase);
        if (nextPhase === "inhale") {
          setCycles((c) => {
            cyclesRef.current = c + 1;
            return c + 1;
          });
        }
        return PHASE_SECONDS;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function start() {
    phaseIndexRef.current = 0;
    setPhase("inhale");
    setSecondsLeft(PHASE_SECONDS);
    setCycles(0);
    cyclesRef.current = 0;
    setRunning(true);
  }

  function stop() {
    setRunning(false);
    if (cyclesRef.current >= 1) {
      logSession();
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="eyebrow">SOS · breathing</p>
        {running && (
          <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">
            Cycle {cycles + 1}
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
            transform: `scale(${running ? PHASE_SCALE[phase] : 1})`,
            transition: `transform ${PHASE_SECONDS}s ease-in-out`,
          }}
        >
          <div className="text-center">
            <p className="text-sm text-[color:var(--ink)]">{running ? PHASE_LABEL[phase] : "Ready"}</p>
            {running && <p className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular mt-1">{secondsLeft}</p>}
          </div>
        </div>

        {running ? (
          <button onClick={stop} className="btn-ghost rounded-full px-5 py-2 text-xs">
            Stop
          </button>
        ) : (
          <button onClick={start} className="btn-ghost rounded-full px-5 py-2 text-xs">
            Start breathing exercise
          </button>
        )}
      </div>

      <p className="text-xs text-[color:var(--ink-faint)] text-center">
        Box breathing: in for 4s, hold for 4s, out for 4s, hold for 4s. A few cycles can take the edge off in the
        moment.
      </p>
      <p className="text-[11px] text-[color:var(--ink-faint)] text-center mt-3">
        This is a general stress tool, not a substitute for professional care. If you&apos;re in crisis or need
        urgent support, please contact a mental health professional or your local emergency services.
      </p>
    </div>
  );
}
