"use client";

import { useEffect, useState } from "react";
import { startSound, stopSound, setVolume as setEngineVolume, type SoundKind } from "@/lib/ambientSound";

const SOUNDS: { key: SoundKind; label: string }[] = [
  { key: "rain", label: "Rain" },
  { key: "ocean", label: "Ocean waves" },
  { key: "whitenoise", label: "White noise" },
];

export default function AmbientSounds() {
  const [playing, setPlaying] = useState<SoundKind | null>(null);
  const [volume, setVolume] = useState("50");

  useEffect(() => {
    return () => stopSound();
  }, []);

  function toggle(kind: SoundKind) {
    if (playing === kind) {
      stopSound();
      setPlaying(null);
    } else {
      startSound(kind, parseInt(volume, 10) / 100);
      setPlaying(kind);
    }
  }

  function changeVolume(v: string) {
    setVolume(v);
    if (playing) setEngineVolume(parseInt(v, 10) / 100);
  }

  return (
    <div className="card p-6">
      <p className="eyebrow mb-5">Ambient sounds</p>
      <div className="flex gap-2 flex-wrap mb-4">
        {SOUNDS.map((s) => (
          <button
            key={s.key}
            onClick={() => toggle(s.key)}
            className="btn-ghost rounded-full px-4 py-2 text-xs"
            style={playing === s.key ? { background: "var(--line)" } : undefined}
          >
            {playing === s.key ? "■ " : "▶ "}
            {s.label}
          </button>
        ))}
      </div>
      {playing && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand">Volume</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={volume}
            onChange={(e) => changeVolume(e.target.value)}
            className="flex-1"
          />
        </div>
      )}
      <p className="text-xs text-[color:var(--ink-faint)]">
        Generated live in your browser — no files to load, loops for as long as you keep this tab open. Pair it
        with a grounding exercise or a meditation, or just let it run in the background.
      </p>
    </div>
  );
}
