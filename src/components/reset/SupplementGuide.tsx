"use client";

import { useState } from "react";

type Supplement = {
  id: string;
  name: string;
  tagline: string;
  purpose: string;
  typicalDose: string;
  timing: string;
};

const SUPPLEMENTS: Supplement[] = [
  {
    id: "protein",
    name: "Protein powder",
    tagline: "Fills the gap between food and your protein target",
    purpose:
      "A convenient way to hit a daily protein target that's hard to reach from food alone, supporting muscle repair and growth around training.",
    typicalDose: "Commonly 20–40g per serving, sized to whatever's left of your daily protein target.",
    timing: "Any time — post-workout or as a snack are the most common choices.",
  },
  {
    id: "creatine",
    name: "Creatine monohydrate",
    tagline: "One of the most studied supplements for strength and power",
    purpose: "Helps muscles produce energy during short, intense efforts — commonly used to support strength and power output.",
    typicalDose: "Commonly 3–5g per day, taken consistently rather than timed around workouts.",
    timing: "Any time of day — consistency matters more than timing.",
  },
  {
    id: "multivitamin",
    name: "Multivitamin",
    tagline: "A broad backstop for an inconsistent diet",
    purpose: "Covers gaps in micronutrient intake on days when meals aren't fully balanced.",
    typicalDose: "One serving per the product label — doses vary a lot by brand and formulation.",
    timing: "With a meal, to help with absorption and reduce stomach upset.",
  },
  {
    id: "omega3",
    name: "Omega-3 (fish oil)",
    tagline: "Supports heart and joint health, especially if you eat little fish",
    purpose: "Provides EPA/DHA fats most people get from fatty fish — relevant if fish isn't a regular part of your diet.",
    typicalDose: "Commonly 1–2g combined EPA/DHA per day — check the label, concentrations vary widely.",
    timing: "With a meal containing some fat, to help absorption.",
  },
  {
    id: "vitaminc",
    name: "Vitamin C",
    tagline: "Supports immune function and collagen production",
    purpose: "An antioxidant involved in immune function, skin, and connective tissue health.",
    typicalDose: "Commonly 500–1000mg per day — well above what most varied diets need on their own.",
    timing: "Any time, with or without food.",
  },
  {
    id: "vitamind3",
    name: "Vitamin D3",
    tagline: "The one most people with limited sun exposure are short on",
    purpose: "Supports bone health, immune function, and mood — commonly low in people who spend most of the day indoors.",
    typicalDose: "Commonly 1000–2000 IU per day for general maintenance — a blood test is the only way to know your actual level.",
    timing: "With a meal containing fat — it's fat-soluble and absorbs better that way.",
  },
  {
    id: "zma",
    name: "ZMA (zinc, magnesium, B6)",
    tagline: "A sleep and recovery stack popular with lifters",
    purpose: "Combines zinc and magnesium, often used to support sleep quality and recovery between training sessions.",
    typicalDose: "Commonly one serving per the product label, roughly 30 minutes before bed.",
    timing: "Before bed, on an empty-ish stomach — avoid taking it with calcium-rich food, which blocks absorption.",
  },
];

export default function SupplementGuide() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="card p-6">
      <p className="eyebrow mb-2">Recommended supplements</p>
      <p className="text-xs text-[color:var(--ink-faint)] mb-4">
        General information, not medical advice — check with a doctor before starting any supplement, especially if
        you take medication or have a health condition.
      </p>
      <div className="flex flex-col gap-2.5">
        {SUPPLEMENTS.map((s) => (
          <div
            key={s.id}
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}
          >
            <button
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <p className="text-[15px] font-medium">{s.name}</p>
                <p className="text-xs text-[color:var(--ink-faint)]">{s.tagline}</p>
              </div>
              <span className="text-xs text-[color:var(--ink-faint)] shrink-0 ml-3">
                {expanded === s.id ? "−" : "+"}
              </span>
            </button>
            {expanded === s.id && (
              <div className="px-4 pb-4 flex flex-col gap-2.5">
                <p className="text-sm text-[color:var(--ink-dim)]">{s.purpose}</p>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--ink-faint)] mb-1">Typical dose</p>
                  <p className="text-sm text-[color:var(--ink-dim)]">{s.typicalDose}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--ink-faint)] mb-1">Timing</p>
                  <p className="text-sm text-[color:var(--ink-dim)]">{s.timing}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
