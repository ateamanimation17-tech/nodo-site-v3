import Link from "next/link";
import TaskBoard from "@/components/brain/TaskBoard";

export const metadata = { title: "Project — NODO" };

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
      <Link
        href="/app/brain"
        className="text-sm text-[color:var(--ink-faint)] hover:text-[color:var(--ink)] mb-8 inline-block"
      >
        ← Brain
      </Link>
      <TaskBoard projectId={id} />
    </div>
  );
}
