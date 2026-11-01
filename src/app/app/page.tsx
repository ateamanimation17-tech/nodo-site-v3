import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const metadata = { title: "Dashboard — NODO" };

const TABS = [
  {
    href: "/app/brain",
    tag: "01 — BRAIN",
    title: "Projects & focus",
    body: "Projects, tasks, your daily habit checklist, and a focus timer.",
  },
  {
    href: "/app/reset",
    tag: "02 — RESET",
    title: "Training & food",
    body: "Your workout split and a macro-matched meal rotation.",
  },
  {
    href: "/app/finance",
    tag: "03 — FINANCE",
    title: "Money",
    body: "Net worth, budgets, subscriptions, and savings goals.",
  },
  {
    href: "/app/anxiety",
    tag: "04 — ANXIETY",
    title: "Anxiety control",
    body: "Worry dump, exposure challenges, and grounding tools.",
  },
];

export default async function AppHome() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
      <p className="eyebrow mb-3">Welcome back</p>
      <h1 className="font-display text-3xl md:text-4xl mb-10 break-words">
        {user?.email ?? "Your dashboard"}
      </h1>
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
