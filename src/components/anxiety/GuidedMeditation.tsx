"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { startSound, stopSound, type SoundKind } from "@/lib/ambientSound";

type Step = { text: string; seconds: number };
type MeditationKey = "breath" | "bodyscan" | "visualization";

const MEDITATIONS: Record<MeditationKey, { label: string; steps: Step[] }> = {
  breath: {
    label: "Breath awareness",
    steps: [
      { text: "Find a comfortable position and let your eyes close, or soften your gaze.", seconds: 15 },
      { text: "Bring your attention to your breath, without trying to change it.", seconds: 25 },
      { text: "Notice the air entering your nostrils, cool on the way in.", seconds: 25 },
      { text: "Follow the breath down into your chest and belly as it rises and falls.", seconds: 30 },
      { text: "Notice the brief, natural pause at the top of the inhale.", seconds: 20 },
      { text: "Notice the brief, natural pause at the bottom of the exhale.", seconds: 20 },
      { text: "If your mind has wandered, that's completely normal — gently bring it back to the breath.", seconds: 30 },
      { text: "Keep following each breath, one at a time, with nothing else to do.", seconds: 60 },
      { text: "Take one more full, slow breath, then gently let your eyes open.", seconds: 15 },
    ],
  },
  bodyscan: {
    label: "Body scan",
    steps: [
      { text: "Settle into a comfortable position, seated or lying down.", seconds: 15 },
      { text: "Bring your attention to the top of your head and your scalp.", seconds: 20 },
      { text: "Notice any sensation in your face — forehead, eyes, jaw. Let it soften.", seconds: 25 },
      { text: "Move your attention to your neck and shoulders. Let them drop.", seconds: 25 },
      { text: "Notice your arms, down through your hands to your fingertips.", seconds: 25 },
      { text: "Bring attention to your chest, feeling it rise and fall with each breath.", seconds: 25 },
      { text: "Notice your stomach and lower back.", seconds: 25 },
      { text: "Let your attention move to your hips and thighs.", seconds: 25 },
      { text: "Notice your knees, calves, and feet, all the way to your toes.", seconds: 25 },
      { text: "Take a moment to feel your whole body at once, resting.", seconds: 30 },
      { text: "Slowly bring your attention back to the room around you.", seconds: 15 },
    ],
  },
  visualization: {
    label: "Visualization",
    steps: [
      { text: "Close your eyes and take a few slow, easy breaths.", seconds: 15 },
      { text: "Picture a place where you feel completely at ease — real or imagined.", seconds: 25 },
      { text: "Notice what you can see there — the colors, the light, the shapes around you.", seconds: 25 },
      { text: "Notice any sounds in this place.", seconds: 20 },
      { text: "Notice the temperature, and how the air feels on your skin.", seconds: 20 },
      { text: "Notice any scents around you.", seconds: 20 },
      { text: "Let yourself fully settle into this place, with nothing to do but be here.", seconds: 35 },
      { text: "When you're ready, gently bring your attention back to the room.", seconds: 15 },
    ],
  },
};

const SOUND_OPTIONS: { key: SoundKind | "none"; label: string }[] = [
  { key: "none", label: "None" },
  { key: "rain", label: "Rain" },
  { key: "ocean", label: "Ocean" },
  { key: "whitenoise", label: "White noise" },
];

async function logSession(label: string) {
  const supabase = getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("grounding_sessions").insert({ user_id: user.id, kind: "meditation", label });
}

export default function GuidedMeditation() {
  const [meditation, setMeditation] = useState<MeditationKey>("breath");
  const [sound, setSound] = useState<SoundKind | "none">("none");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(MEDITATIONS.breath.steps[0].seconds);
  const stepIndexRef = useRef(0);
  const startedSoundRef = useRef(false);

  const current = MEDITATIONS[meditation];

  function stopAudioIfOwned() {
    if (startedSoundRef.current) {
      stopSound();
      startedSoundRef.current = false;
    }
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        const next = stepIndexRef.current + 1;
        if (next >= current.steps.length) {
          setRunning(false);
          setDone(true);
          stopAudioIfOwned();
          logSession(current.label);
          return current.steps[current.steps.length - 1].seconds;
        }
        stepIndexRef.current = next;
        setStepIndex(next);
        return current.steps[next].seconds;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, current]);

  useEffect(() => {
    return () => stopAudioIfOwned();
  }, []);

  function start() {
    stepIndexRef.current = 0;
    setStepIndex(0);
    setSecondsLeft(current.steps[0].seconds);
    setDone(false);
    setRunning(true);
    if (sound !== "none") {
      startSound(sound, 0.4);
      startedSoundRef.current = true;
    }
  }

  function stop() {
    setRunning(false);
    stopAudioIfOwned();
  }

  function selectMeditation(key: MeditationKey) {
    if (running) return;
    setMeditation(key);
    setStepIndex(0);
    stepIndexRef.current = 0;
    setSecondsLeft(MEDITATIONS[key].steps[0].seconds);
    setDone(false);
  }

  const totalMinutes = Math.round(current.steps.reduce((a, s) => a + s.seconds, 0) / 60);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="eyebrow">Guided meditation</p>
        {running && (
          <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">
            Step {stepIndex + 1} / {current.steps.length}
          </span>
        )}
      </div>

      {!running && (
        <div className="flex gap-2 flex-wrap mb-4">
          {(Object.keys(MEDITATIONS) as MeditationKey[]).map((key) => (
            <button
              key={key}
              onClick={() => selectMeditation(key)}
              className="btn-ghost rounded-full px-4 py-2 text-xs"
              style={meditation === key ? { background: "var(--line)" } : undefined}
            >
              {MEDITATIONS[key].label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center py-6">
        <div
          className="rounded-xl flex items-center justify-center mb-6 px-6 text-center w-full"
          style={{
            minHeight: 140,
            background: "var(--bg-raised)",
            border: "1px solid var(--line-strong)",
          }}
        >
          {running ? (
            <div>
              <p className="text-sm text-[color:var(--ink)] leading-relaxed">{current.steps[stepIndex].text}</p>
              <p className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular mt-3">{secondsLeft}</p>
            </div>
          ) : done ? (
            <p className="text-sm text-[color:var(--ink)]">Session complete</p>
          ) : (
            <p className="text-sm text-[color:var(--ink-faint)]">
              {current.label} · about {totalMinutes} min
            </p>
          )}
        </div>

        {running ? (
          <button onClick={stop} className="btn-ghost rounded-full px-5 py-2 text-xs">
            Stop
          </button>
        ) : (
          <button onClick={start} className="btn-ghost rounded-full px-5 py-2 text-xs">
            {done ? "Go again" : "Start meditation"}
          </button>
        )}
      </div>

      {!running && (
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand">Background sound</span>
          {SOUND_OPTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSound(s.key)}
              className="btn-ghost rounded-full px-3 py-1 text-xs"
              style={sound === s.key ? { background: "var(--line)" } : undefined}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-[color:var(--ink-faint)] text-center mt-3">
        This is a general stress tool, not a substitute for professional care. If you&apos;re in crisis or need
        urgent support, please contact a mental health professional or your local emergency services.
      </p>
    </div>
  );
}
