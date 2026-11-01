"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Status = "planned" | "in_progress" | "completed";
type Rung = {
  id: string;
  title: string;
  difficulty: number;
  status: Status;
  anxiety_before: number | null;
  anxiety_after: number | null;
  notes: string | null;
};

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };

const STARTER_RUNGS = [
  { title: "Order coffee and make small talk with the barista", difficulty: 20 },
  { title: "Make a phone call you've been avoiding", difficulty: 40 },
  { title: "Speak up with your opinion in a meeting", difficulty: 55 },
  { title: "Attend a social event and start a conversation with someone new", difficulty: 70 },
];

export default function ExposureLadder() {
  const [rungs, setRungs] = useState<Rung[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("50");
  const [completing, setCompleting] = useState<string | null>(null);
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [notes, setNotes] = useState("");

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
      .from("exposure_challenges")
      .select("id, title, difficulty, status, anxiety_before, anxiety_after, notes")
      .eq("user_id", user.id)
      .order("difficulty", { ascending: true });
    let rungList = (data as Rung[]) ?? [];

    // A few editable starter examples so the ladder isn't an empty page —
    // just illustrating the format; delete or edit freely.
    if (rungList.length === 0) {
      const { data: seeded } = await supabase
        .from("exposure_challenges")
        .insert(
          STARTER_RUNGS.map((r) => ({
            user_id: user.id,
            title: r.title,
            difficulty: r.difficulty,
            status: "planned",
          }))
        )
        .select("id, title, difficulty, status, anxiety_before, anxiety_after, notes");
      rungList = (seeded as Rung[]) ?? [];
    }

    setRungs(rungList);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function addRung() {
    const value = Math.min(100, Math.max(0, parseInt(difficulty, 10) || 0));
    if (!title.trim()) return;
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("exposure_challenges")
      .insert({ user_id: user.id, title: title.trim(), difficulty: value, status: "planned" })
      .select("id, title, difficulty, status, anxiety_before, anxiety_after, notes")
      .single();

    if (!error && data) {
      setRungs((prev) => [...prev, data as Rung].sort((a, b) => a.difficulty - b.difficulty));
      setTitle("");
      setDifficulty("50");
      setShowAdd(false);
    }
  }

  async function setStatus(id: string, status: Status) {
    const supabase = getSupabaseClient();
    await supabase.from("exposure_challenges").update({ status }).eq("id", id);
    setRungs((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  async function completeRung(id: string) {
    const b = parseInt(before, 10);
    const a = parseInt(after, 10);
    const supabase = getSupabaseClient();
    const payload = {
      status: "completed" as Status,
      anxiety_before: Number.isNaN(b) ? null : Math.min(100, Math.max(0, b)),
      anxiety_after: Number.isNaN(a) ? null : Math.min(100, Math.max(0, a)),
      notes: notes.trim() || null,
      completed_at: new Date().toISOString(),
    };
    await supabase.from("exposure_challenges").update(payload).eq("id", id);
    setRungs((prev) => prev.map((r) => (r.id === id ? { ...r, ...payload } : r)));
    setCompleting(null);
    setBefore("");
    setAfter("");
    setNotes("");
  }

  async function removeRung(id: string) {
    const supabase = getSupabaseClient();
    await supabase.from("exposure_challenges").delete().eq("id", id);
    setRungs((prev) => prev.filter((r) => r.id !== id));
  }

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
        <p className="eyebrow">Exposure ladder</p>
        <button onClick={() => setShowAdd((v) => !v)} className="btn-ghost rounded-full px-4 py-2 text-xs">
          {showAdd ? "Cancel" : "Add rung"}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl p-4 mb-5 flex flex-col gap-3" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Situation, e.g. Ask a question after a talk"
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="flex-1"
            />
            <span className="text-xs font-mono-brand tabular text-[color:var(--ink-faint)] w-10 text-right">{difficulty}</span>
          </div>
          <p className="text-[11px] text-[color:var(--ink-faint)]">0 = barely anxious, 100 = extremely anxious</p>
          <button onClick={addRung} className="btn-ghost rounded-md px-4 py-2 text-xs self-start">
            Add
          </button>
        </div>
      )}

      {rungs.length === 0 ? (
        <p className="text-sm text-[color:var(--ink-faint)]">No rungs yet — add one to start building your ladder.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rungs.map((r) => (
            <div key={r.id} className="rounded-xl p-4" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm flex-1">{r.title}</p>
                <button onClick={() => removeRung(r.id)} className="btn-ghost rounded-full px-2 py-1 text-xs shrink-0">
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                  <div className="h-full rounded-full" style={{ width: `${r.difficulty}%`, background: "var(--accent)" }} />
                </div>
                <span className="text-[11px] font-mono-brand tabular text-[color:var(--ink-faint)] w-8 text-right">{r.difficulty}</span>
              </div>

              {r.status === "completed" ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand">Completed</span>
                  {r.anxiety_before != null && r.anxiety_after != null && (
                    <span className="text-xs font-mono-brand tabular text-[color:var(--ink-faint)]">
                      Anxiety {r.anxiety_before} → {r.anxiety_after}
                    </span>
                  )}
                  {r.notes && <span className="text-xs text-[color:var(--ink-faint)]">· {r.notes}</span>}
                </div>
              ) : completing === r.id ? (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex gap-2">
                    <input
                      value={before}
                      onChange={(e) => setBefore(e.target.value)}
                      placeholder="Anxiety before (0–100)"
                      className="flex-1 rounded-md px-3 py-2 text-xs outline-none"
                      style={inputStyle}
                    />
                    <input
                      value={after}
                      onChange={(e) => setAfter(e.target.value)}
                      placeholder="Anxiety after (0–100)"
                      className="flex-1 rounded-md px-3 py-2 text-xs outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did it go? (optional)"
                    className="rounded-md px-3 py-2 text-xs outline-none"
                    style={inputStyle}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => completeRung(r.id)} className="btn-ghost rounded-full px-3 py-1 text-xs">
                      Save
                    </button>
                    <button onClick={() => setCompleting(null)} className="btn-ghost rounded-full px-3 py-1 text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  {r.status === "planned" && (
                    <button onClick={() => setStatus(r.id, "in_progress")} className="btn-ghost rounded-full px-3 py-1 text-xs">
                      Start
                    </button>
                  )}
                  {r.status === "in_progress" && (
                    <span className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand">
                      In progress
                    </span>
                  )}
                  <button onClick={() => setCompleting(r.id)} className="btn-ghost rounded-full px-3 py-1 text-xs">
                    Mark done
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
