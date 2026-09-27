"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await getSupabaseClient().auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 flex flex-col gap-4">
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
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
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
