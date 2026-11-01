"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Record_ = {
  id: string;
  situation: string;
  automatic_thought: string;
  intensity_before: number;
  evidence_for: string | null;
  evidence_against: string | null;
  balanced_thought: string | null;
  intensity_after: number | null;
  created_at: string;
};

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };

const STEPS = [
  { key: "situation", title: "What happened?", placeholder: "Describe the situation that triggered the anxious thought", kind: "text" as const, required: true },
  { key: "automatic_thought", title: "What went through your mind?", placeholder: "The automatic thought, as exactly as you can recall it", kind: "text" as const, required: true },
  { key: "intensity_before", title: "How intense did it feel?", kind: "slider" as const, required: true },
  { key: "evidence_for", title: "Evidence that supports this thought", placeholder: "What makes it feel true? (optional)", kind: "text" as const, required: false },
  { key: "evidence_against", title: "Evidence against this thought", placeholder: "What doesn't fit, or would you tell a friend? (optional)", kind: "text" as const, required: false },
  { key: "balanced_thought", title: "A more balanced thought", placeholder: "Given both sides, what's a fairer way to see it? (optional)", kind: "text" as const, required: false },
  { key: "intensity_after", title: "How intense does it feel now?", kind: "slider" as const, required: false },
] as const;

type FormState = {
  situation: string;
  automatic_thought: string;
  intensity_before: string;
  evidence_for: string;
  evidence_against: string;
  balanced_thought: string;
  intensity_after: string;
};

const EMPTY_FORM: FormState = {
  situation: "",
  automatic_thought: "",
  intensity_before: "5",
  evidence_for: "",
  evidence_against: "",
  balanced_thought: "",
  intensity_after: "5",
};

export default function ThoughtRecord() {
  const [records, setRecords] = useState<Record_[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [touchedAfter, setTouchedAfter] = useState(false);

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
      .from("thought_records")
      .select(
        "id, situation, automatic_thought, intensity_before, evidence_for, evidence_against, balanced_thought, intensity_after, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setRecords((data as Record_[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function startAdd() {
    setForm(EMPTY_FORM);
    setStep(0);
    setTouchedAfter(false);
    setShowAdd(true);
  }

  function cancelAdd() {
    setShowAdd(false);
  }

  const current = STEPS[step];
  const canAdvance = !current.required || form[current.key].trim().length > 0;

  async function save() {
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      situation: form.situation.trim(),
      automatic_thought: form.automatic_thought.trim(),
      intensity_before: Math.min(10, Math.max(0, parseInt(form.intensity_before, 10) || 0)),
      evidence_for: form.evidence_for.trim() || null,
      evidence_against: form.evidence_against.trim() || null,
      balanced_thought: form.balanced_thought.trim() || null,
      intensity_after: touchedAfter ? Math.min(10, Math.max(0, parseInt(form.intensity_after, 10) || 0)) : null,
    };

    const { data, error } = await supabase
      .from("thought_records")
      .insert(payload)
      .select(
        "id, situation, automatic_thought, intensity_before, evidence_for, evidence_against, balanced_thought, intensity_after, created_at"
      )
      .single();

    if (!error && data) {
      setRecords((prev) => [data as Record_, ...prev]);
      setShowAdd(false);
    }
  }

  async function removeRecord(id: string) {
    const supabase = getSupabaseClient();
    await supabase.from("thought_records").delete().eq("id", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
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
        <p className="eyebrow">Thought record</p>
        {!showAdd && (
          <button onClick={startAdd} className="btn-ghost rounded-full px-4 py-2 text-xs">
            Work through a thought
          </button>
        )}
      </div>

      {showAdd && (
        <div
          className="rounded-xl p-4 mb-5 flex flex-col gap-4"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand">
              Step {step + 1} of {STEPS.length}
            </span>
            <button onClick={cancelAdd} className="btn-ghost rounded-full px-3 py-1 text-xs">
              Cancel
            </button>
          </div>

          <p className="text-sm">{current.title}</p>

          {current.kind === "text" ? (
            <textarea
              value={form[current.key]}
              onChange={(e) => setForm((f) => ({ ...f, [current.key]: e.target.value }))}
              placeholder={current.placeholder}
              rows={3}
              autoFocus
              className="rounded-md px-3 py-2 text-sm outline-none resize-none"
              style={inputStyle}
            />
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={form[current.key]}
                onChange={(e) => {
                  if (current.key === "intensity_after") setTouchedAfter(true);
                  setForm((f) => ({ ...f, [current.key]: e.target.value }));
                }}
                className="flex-1"
              />
              <span className="text-sm font-mono-brand tabular text-[color:var(--ink-faint)] w-8 text-right">
                {form[current.key]}
              </span>
            </div>
          )}
          {current.kind === "slider" && (
            <p className="text-[11px] text-[color:var(--ink-faint)]">0 = calm, 10 = overwhelming</p>
          )}

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="btn-ghost rounded-full px-4 py-2 text-xs">
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance}
                className="btn-ghost rounded-full px-4 py-2 text-xs disabled:opacity-40"
              >
                Next
              </button>
            ) : (
              <button onClick={save} className="btn-ghost rounded-full px-4 py-2 text-xs">
                Save
              </button>
            )}
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <p className="text-sm text-[color:var(--ink-faint)]">
          No thought records yet — next time something spirals, walk it through here.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((r) => (
            <ThoughtCard key={r.id} record={r} onRemove={removeRecord} />
          ))}
        </div>
      )}
    </div>
  );
}

function ThoughtCard({ record: r, onRemove }: { record: Record_; onRemove: (id: string) => void }) {
  const improved = r.intensity_after != null && r.intensity_after < r.intensity_before;
  return (
    <details className="rounded-xl p-4" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm flex-1">{r.situation}</p>
          <div className="flex items-center gap-2 shrink-0">
            {r.intensity_after != null ? (
              <span
                className="text-xs font-mono-brand tabular"
                style={{ color: improved ? "var(--ink)" : "var(--ink-faint)" }}
              >
                {r.intensity_before} → {r.intensity_after}
              </span>
            ) : (
              <span className="text-xs font-mono-brand tabular text-[color:var(--ink-faint)]">{r.intensity_before}</span>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                onRemove(r.id);
              }}
              className="btn-ghost rounded-full px-2 py-1 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      </summary>
      <div className="mt-3 flex flex-col gap-2 text-xs text-[color:var(--ink-faint)]">
        <p>
          <span className="text-[color:var(--ink)]">Thought: </span>
          {r.automatic_thought}
        </p>
        {r.evidence_for && (
          <p>
            <span className="text-[color:var(--ink)]">For: </span>
            {r.evidence_for}
          </p>
        )}
        {r.evidence_against && (
          <p>
            <span className="text-[color:var(--ink)]">Against: </span>
            {r.evidence_against}
          </p>
        )}
        {r.balanced_thought && (
          <p>
            <span className="text-[color:var(--ink)]">Balanced view: </span>
            {r.balanced_thought}
          </p>
        )}
      </div>
    </details>
  );
}
