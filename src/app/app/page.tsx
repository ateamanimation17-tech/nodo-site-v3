import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import WeeklySummary from "@/components/dashboard/WeeklySummary";
import NamePrompt from "@/components/dashboard/NamePrompt";

export const metadata = { title: "Dashboard — NODO" };

const TABS = [
  {
    href: "/app/brain",
    tag: "01 — PROJECTS MANAGEMENT",
    title: "Projects & focus",
    body: "Projects, tasks, your daily habit checklist, and a focus timer.",
  },
  {
    href: "/app/reset",
    tag: "02 — THE NODO RESET METHOD",
    title: "Training & food",
    body: "Your workout split, a macro-matched meal rotation, and daily steps.",
  },
  {
    href: "/app/finance",
    tag: "03 — FINANCES MANAGEMENT",
    title: "Money",
    body: "Net worth, budgets, subscriptions, income, and savings goals.",
  },
  {
    href: "/app/anxiety",
    tag: "04 — ANXIETY CONTROL",
    title: "Worry, exposure & grounding",
    body: "Worry dump, exposure challenges, guided meditation, and daily check-ins.",
  },
];

export default async function AppHome() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let fullName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();
    fullName = profile?.full_name ?? null;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
      <p className="eyebrow mb-3">Welcome back</p>
      <h1 className="font-display text-3xl md:text-4xl mb-8 break-words">
        {fullName ?? "there"}
      </h1>

      {user && !fullName && <NamePrompt userId={user.id} />}

      {user && <WeeklySummary userId={user.id} />}

      <p className="eyebrow mb-3">Your tabs</p>
      <div className="grid sm:grid-cols-2 gap-6">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="card p-6 flex flex-col gap-2 transition-colors"
          >
            <p className="font-mono-brand text-xs tracking-[0.2em] text-[color:var(--ink-faint)]">
              {t.tag}
            </p>
            <h2 className="font-display text-xl">{t.title}</h2>
            <p className="text-sm text-[color:var(--ink-dim)] leading-relaxed">
              {t.body}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
