import ProjectsSection from "@/components/brain/ProjectsSection";
import HabitsSection from "@/components/brain/HabitsSection";
import FocusTimer from "@/components/brain/FocusTimer";

export const metadata = { title: "Brain — NODO" };

export default function BrainPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <p className="eyebrow mb-3">01 — Brain</p>
      <h1 className="font-display text-3xl md:text-4xl mb-10">Projects & focus</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <HabitsSection />
        <FocusTimer />
      </div>

      <ProjectsSection />
    </div>
  );
}
