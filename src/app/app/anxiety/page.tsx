import AnxietyHome from "@/components/anxiety/AnxietyHome";

export const metadata = { title: "Anxiety Control — NODO" };

export default function AnxietyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <p className="eyebrow mb-3">04 — Anxiety Control</p>
      <h1 className="font-display text-3xl md:text-4xl mb-10">Worry, exposure &amp; grounding</h1>
      <AnxietyHome />
    </div>
  );
}
