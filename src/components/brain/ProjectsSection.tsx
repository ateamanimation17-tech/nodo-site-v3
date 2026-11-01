"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Project = {
  id: string;
  name: string;
  description: string | null;
};

type TaskCounts = { total: number; done: number };

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [counts, setCounts] = useState<Record<string, TaskCounts>>({});
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

    async function load() {
    setLoading(true);
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const [{ data: projectRows }, { data: taskRows }] = await Promise.all([
      supabase
        .from("projects")
        .select("id, name, description")
        .eq("user_id", user.id)
        .eq("archived", false)
        .order("created_at", { ascending: true }),
      supabase.from("tasks").select("project_id, status").eq("user_id", user.id),
    ]);

    const byProject: Record<string, TaskCounts> = {};
    (taskRows ?? []).forEach((t) => {
      if (!byProject[t.project_id]) byProject[t.project_id] = { total: 0, done: 0 };
      byProject[t.project_id].total += 1;
      if (t.status === "done") byProject[t.project_id].done += 1;
    });

    setProjects(projectRows ?? []);
    setCounts(byProject);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCreating(false);
      return;
    }
    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name })
      .select("id, name, description")
      .single();
    if (!error && data) {
      setProjects((prev) => [...prev, data]);
      setNewName("");
    }
    setCreating(false);
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="eyebrow">Projects</p>
      </div>

      {loading ? (
        <p className="text-sm text-[color:var(--ink-faint)] mb-5">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {projects.length === 0 && (
            <p className="text-sm text-[color:var(--ink-faint)]">
              No projects yet — create your first one below.
            </p>
          )}
          {projects.map((project) => {
            const c = counts[project.id] ?? { total: 0, done: 0 };
            const pct = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
            return (
              <Link
                key={project.id}
                href={`/app/brain/projects/${project.id}`}
                className="rounded-xl px-4 py-3.5 flex flex-col gap-2.5 transition-colors"
                style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}
              >
                <span className="text-[15px] font-medium">{project.name}</span>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--green)" }} />
                </div>
                <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular">
                  {c.done}/{c.total} tasks
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <form onSubmit={createProject} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New project name…"
          className="flex-1 rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="btn-ghost rounded-lg px-4 py-2.5 text-sm disabled:opacity-50"
        >
          Create
        </button>
      </form>
    </div>
  );
}
