export default function TabMockup() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[28px] opacity-40 blur-2xl"
        style={{ background: "radial-gradient(closest-side, var(--green-tint), transparent)" }}
      />
      <div className="relative card p-5 md:p-6 shadow-2xl">
        <div className="flex gap-2 mb-5">
          {["Reset", "Finance", "Brain"].map((t, i) => (
            <span
              key={t}
              className="text-xs px-3.5 py-1.5 rounded-full font-mono-brand tracking-wide"
              style={
                i === 0
                  ? { background: "var(--gold)", color: "#191405" }
                  : { border: "1px solid var(--line-strong)", color: "var(--ink-dim)" }
              }
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="eyebrow mb-1">Momentum</p>
            <p className="font-display text-2xl tabular">18 / 30</p>
          </div>
          <div className="text-right">
            <p className="eyebrow mb-1">Streak</p>
            <p className="font-display text-2xl tabular" style={{ color: "var(--green)" }}>
              6 days
            </p>
          </div>
        </div>

        <div className="grid grid-cols-10 gap-1.5 mb-6">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-[3px]"
              style={{
                background:
                  i < 18
                    ? i % 4 === 0
                      ? "var(--gold)"
                      : "var(--green)"
                    : "rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            ["Protein", "162g", "var(--gold)"],
            ["Kcal", "2,340", "var(--green)"],
            ["Steps", "8.4k", "var(--gold-bright)"],
          ].map(([label, val, color]) => (
            <div
              key={label}
              className="rounded-xl p-3.5"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}
            >
              <p className="text-[10px] uppercase tracking-widest text-[color:var(--ink-faint)] mb-1.5">
                {label}
              </p>
              <p className="font-display text-lg tabular" style={{ color }}>
                {val}
              </p>
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-[color:var(--ink-faint)] mt-4 font-mono-brand">
        Illustrative preview — your actual dashboard fills in from your own numbers
      </p>
    </div>
  );
}
