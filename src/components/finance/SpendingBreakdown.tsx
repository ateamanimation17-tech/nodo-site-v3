"use client";

import { useState } from "react";
import { formatEUR } from "@/lib/currency";

type Category = { id: string; name: string; monthly_limit: number };

export default function SpendingBreakdown({
  categories,
  spentByCategory,
}: {
  categories: Category[];
  spentByCategory: Record<string, number>;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const entries = categories
    .map((c) => ({ id: c.id, name: c.name, spent: spentByCategory[c.id] ?? 0 }))
    .filter((e) => e.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const total = entries.reduce((sum, e) => sum + e.spent, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl p-4" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
        <p className="eyebrow mb-1">Where it&apos;s going</p>
        <p className="text-sm text-[color:var(--ink-faint)]">Log an expense to see your spending breakdown.</p>
      </div>
    );
  }

  const maxSpent = entries[0].spent;

  return (
    <div className="rounded-xl p-4" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <p className="eyebrow">Where it&apos;s going</p>
        <span className="text-xs font-mono-brand tabular text-[color:var(--ink-faint)]">
          {formatEUR(total)} total
        </span>
      </div>

      <div className="flex flex-col gap-3" role="list" aria-label="Spending by category, ranked largest first">
        {entries.map((e) => {
          const widthPct = Math.max((e.spent / maxSpent) * 100, 3);
          const sharePct = Math.round((e.spent / total) * 100);
          const isHovered = hovered === e.id;
          return (
            <div
              key={e.id}
              role="listitem"
              aria-label={`${e.name}: ${formatEUR(e.spent)}, ${sharePct}% of spending`}
              onMouseEnter={() => setHovered(e.id)}
              onMouseLeave={() => setHovered((h) => (h === e.id ? null : h))}
              onFocus={() => setHovered(e.id)}
              onBlur={() => setHovered((h) => (h === e.id ? null : h))}
              tabIndex={0}
              className="outline-none rounded-md -mx-1 px-1 py-0.5 transition-colors"
              style={{ background: isHovered ? "var(--line)" : "transparent" }}
            >
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-sm truncate">{e.name}</span>
                <span className="text-xs font-mono-brand tabular text-[color:var(--ink-faint)] shrink-0">
                  {formatEUR(e.spent)} · {sharePct}%
                </span>
              </div>
              <div className="h-[10px] rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                <div
                  className="h-full rounded-full transition-[width,opacity]"
                  style={{
                    width: `${widthPct}%`,
                    background: "var(--accent)",
                    opacity: isHovered ? 1 : 0.85,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
