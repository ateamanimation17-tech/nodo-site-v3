"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function NamePrompt({ userId }: { userId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);

    const { error } = await getSupabaseClient()
      .from("user_profiles")
      .upsert({ user_id: userId, full_name: trimmed }, { onConflict: "user_id" });

    if (error) {
      setError("Couldn't save your name — please try again.");
      setSaving(false);
      return;
    }

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSave}
      className="card p-5 flex flex-col sm:flex-row sm:items-center gap-3 mb-8"
    >
      <p className="text-sm text-[color:var(--ink-dim)] flex-1">
        What should we call you?
      </p>
      <input
        type="text"
        required
        maxLength={60}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="rounded-lg px-3.5 py-2 text-sm outline-none"
        style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
      />
      <button
        type="submit"
        disabled={saving}
        className="btn-accent rounded-full px-5 py-2 text-sm disabled:opacity-60 shrink-0"
      >
        {saving ? "Saving…" : "Save"}
      </button>
      {error && (
        <p className="text-xs w-full" style={{ color: "#e5787c" }}>
          {error}
        </p>
      )}
    </form>
  );
}
