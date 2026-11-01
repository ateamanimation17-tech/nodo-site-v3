import ResetHome from "@/components/reset/ResetHome";

export const metadata = { title: "The Nodo Reset Method — NODO" };

export default function ResetPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <p className="eyebrow mb-3">02 — The Nodo Reset Method</p>
      <h1 className="font-display text-3xl md:text-4xl mb-10">Training & food</h1>
      <ResetHome />
    </div>
  );
}
