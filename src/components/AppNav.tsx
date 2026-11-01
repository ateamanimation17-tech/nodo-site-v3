"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";
import { getSupabaseClient } from "@/lib/supabaseClient";

const TABS = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/brain", label: "Brain" },
  { href: "/app/reset", label: "Reset" },
  { href: "/app/finance", label: "Finance" },
  { href: "/app/anxiety", label: "Anxiety" },
];

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await getSupabaseClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-40 border-b hairline backdrop-blur"
      style={{ background: "rgba(35,37,38,0.82)" }}
    >
      <div className="mx-auto max-w-6xl px-6 h-[68px] flex items-center justify-between gap-6">
        <Link href="/app" className="flex items-center gap-2.5 shrink-0">
          <Logo size={26} />
          <span className="font-display text-lg tracking-wide">NODO</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[color:var(--ink-dim)] overflow-x-auto">
          {TABS.map((tab) => {
            const active =
              tab.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="transition-colors whitespace-nowrap"
                style={{ color: active ? "var(--ink)" : "var(--ink-dim)" }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn-ghost rounded-full px-5 py-2.5 text-sm shrink-0 disabled:opacity-60"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </header>
  );
}
