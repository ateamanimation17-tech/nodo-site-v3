"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await getSupabaseClient().auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError(
          "Account created, but we couldn't start checkout. Please log in and try again from the pricing page."
        );
        return;
      }

      const trimmedName = name.trim();
      if (trimmedName) {
        await getSupabaseClient()
          .from("user_profiles")
          .upsert({ user_id: userId, full_name: trimmedName }, { onConflict: "user_id" });
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });
      const payload = await res.json();

      if (!res.ok || !payload.url) {
        setError(
          "Account created, but we couldn't start checkout. Please log in and try again from the pricing page."
        );
        return;
      }

      window.location.href = payload.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 flex flex-col gap-4">
      <label className="text-sm flex flex-col gap-1.5">
        Name
        <input
          type="text"
          required
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="rounded-lg px-3.5 py-2.5 text-[15px] outline-none"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
        />
      </label>
      <label className="text-sm flex flex-col gap-1.5">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="rounded-lg px-3.5 py-2.5 text-[15px] outline-none"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
        />
      </label>
      <label className="text-sm flex flex-col gap-1.5">
        Password
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="rounded-lg px-3.5 py-2.5 text-[15px] outline-none"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
        />
      </label>
      {error && (
        <p className="text-sm" style={{ color: "#e5787c" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn-accent rounded-full px-6 py-3 text-[15px] mt-2 disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-xs text-[color:var(--ink-faint)] text-center leading-relaxed">
        Next, you&apos;ll add a card to start your 5-day free trial — you won&apos;t be
        charged until it ends, and you can cancel anytime before then.
      </p>
    </form>
  );
}
