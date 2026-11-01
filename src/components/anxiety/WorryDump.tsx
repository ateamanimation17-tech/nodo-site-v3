"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Worry = {
  id: string;
  worry: string;
  is_controllable: boolean;
  action_step: string | null;
  reframe_note: string | null;
  resolved: boolean;
  created_at: string;
};

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };

export default function WorryDump() {
  const [worries, setWorries] = useState<Worry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [text, setText] = useState("");
  const [controllable, setControllable] = useState<boolean | null>(null);
  const [followUp, setFollowUp] = useState("");

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
      .from("worry_entries")
      .select("id, worry, is_controllable, action_step, reframe_note, resolved, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setWorries((data as Worry[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function resetForm() {
    setText("");
    setControllable(null);
    setFollowUp("");
    setShowAdd(false);
  }

  async function addWorry() {
    if (!text.trim() || controllable === null) return;
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("worry_entries")
      .insert({
        user_id: user.id,
        worry: text.trim(),
        is_controllable: controllable,
        action_step: controllable ? followUp.trim() || null : null,
        reframe_note: !controllable ? followUp.trim() || null : null,
        resolved: false,
      })
      .select("id, worry, is_controllable, action_step, reframe_note, resolved, created_at")
      .single();

    if (!error && data) {
      setWorries((prev) => [data as Worry, ...prev]);
      resetForm();
    }
  }

  async function toggleResolved(w: Worry) {
    const supabase = getSupabaseClient();
    await supabase.from("worry_entries").update({ resolved: !w.resolved }).eq("id", w.id);
    setWorries((prev) => prev.map((x) => (x.id === w.id ? { ...x, resolved: !x.resolved } : x)));
  }

  async function removeWorry(id: string) {
    const supabase = getSupabaseClient();
    await supabase.from("worry_entries").delete().eq("id", id);
    setWorries((prev) => prev.filter((w) => w.id !== id));
  }

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-[color:var(--ink-faint)]">Loading…</p>
      </div>
    );
  }

  const unresolved = worries.filter((w) => !w.resolved);
  const resolved = worries.filter((w) => w.resolved);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <p className="eyebrow">Worry dump</p>
        <button onClick={() => setShowAdd((v) => !v)} className="btn-ghost rounded-full px-4 py-2 text-xs">
          {showAdd ? "Cancel" : "Dump a worry"}
        </button>
      </div>
      {unresolved.length > 0 && (
        <p className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular mb-5">
          {unresolved.length} unresolved
        </p>
      )}
      {unresolved.length === 0 && <div className="mb-5" />}

      {showAdd && (
        <div className="rounded-xl p-4 mb-5 flex flex-col gap-3" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            rows={2}
            className="rounded-md px-3 py-2 text-sm outline-none resize-none"
            style={inputStyle}
          />
          {text.trim() && (
            <>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setControllable(true)}
                  className="btn-ghost rounded-full px-3 py-1.5 text-xs"
                  style={controllable === true ? { background: "var(--line)" } : undefined}
                >
                  I can do something about this
                </button>
                <button
                  onClick={() => setControllable(false)}
                  className="btn-ghost rounded-full px-3 py-1.5 text-xs"
                  style={controllable === false ? { background: "var(--line)" } : undefined}
                >
                  This is out of my hands
                </button>
              </div>
              {controllable === true && (
                <input
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="One small step you could take (optional)"
                  className="rounded-md px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              )}
              {controllable === false && (
                <input
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="What would you tell a friend worrying about this? (optional)"
                  className="rounded-md px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              )}
            </>
          )}
          <button
            onClick={addWorry}
            disabled={!text.trim() || controllable === null}
            className="btn-ghost rounded-md px-4 py-2 text-xs self-start disabled:opacity-40"
          >
            Add
          </button>
        </div>
      )}

      {worries.length === 0 ? (
        <p className="text-sm text-[color:var(--ink-faint)]">Nothing dumped yet — get it out of your head and onto the page.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {unresolved.map((w) => (
            <WorryCard key={w.id} worry={w} onToggle={toggleResolved} onRemove={removeWorry} />
          ))}
          {resolved.length > 0 && (
            <details className="mt-1">
              <summary className="text-xs text-[color:var(--ink-faint)] font-mono-brand cursor-pointer">
                {resolved.length} resolved
              </summary>
              <div className="flex flex-col gap-3 mt-3">
                {resolved.map((w) => (
                  <WorryCard key={w.id} worry={w} onToggle={toggleResolved} onRemove={removeWorry} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function WorryCard({
  worry: w,
  onToggle,
  onRemove,
}: {
  worry: Worry;
  onToggle: (w: Worry) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--bg-raised)", border: "1px solid var(--line)", opacity: w.resolved ? 0.6 : 1 }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm flex-1">{w.worry}</p>
        <button onClick={() => onRemove(w.id)} className="btn-ghost rounded-full px-2 py-1 text-xs shrink-0">
          ✕
        </button>
      </div>
      <p className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand mb-1.5">
        {w.is_controllable ? "Actionable" : "Let it go"}
      </p>
      {w.action_step && <p className="text-xs text-[color:var(--ink-faint)] mb-2">Next step: {w.action_step}</p>}
      {w.reframe_note && <p className="text-xs text-[color:var(--ink-faint)] mb-2">{w.reframe_note}</p>}
      <button onClick={() => onToggle(w)} className="btn-ghost rounded-full px-3 py-1 text-xs">
        {w.resolved ? "Resolved" : "Mark resolved"}
      </button>
    </div>
  );
}
