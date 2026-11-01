"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Priority = "low" | "medium" | "high";
type Status = "todo" | "done";

type Task = {
  id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  priority: Priority;
  status: Status;
};

const PRIORITY_COLOR: Record<Priority, string> = {
  high: "#e5787c",
  medium: "var(--ink-dim)",
  low: "var(--ink-faint)",
};

export default function TaskBoard({ projectId }: { projectId: string }) {
  const [projectName, setProjectName] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

    async function load() {
    setLoading(true);
    const supabase = getSupabaseClient();
    const [{ data: project }, { data: taskRows }] = await Promise.all([
      supabase.from("projects").select("name").eq("id", projectId).single(),
      supabase
        .from("tasks")
        .select("id, title, notes, due_date, priority, status")
        .eq("project_id", projectId)
        .order("due_date", { ascending: true, nullsFirst: false }),
    ]);
    setProjectName(project?.name ?? "Project");
    setTasks(taskRows ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [projectId]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
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
      .from("tasks")
      .insert({
        user_id: user.id,
        project_id: projectId,
        title: trimmed,
        priority,
        due_date: dueDate || null,
        notes: notes.trim() || null,
      })
      .select("id, title, notes, due_date, priority, status")
      .single();
    if (!error && data) {
      setTasks((prev) => [...prev, data]);
      setTitle("");
      setNotes("");
      setDueDate("");
      setPriority("medium");
      setShowForm(false);
    }
    setCreating(false);
  }

  async function toggleDone(task: Task) {
    const nextStatus: Status = task.status === "done" ? "todo" : "done";
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    const supabase = getSupabaseClient();
    await supabase
      .from("tasks")
      .update({
        status: nextStatus,
        completed_at: nextStatus === "done" ? new Date().toISOString() : null,
      })
      .eq("id", task.id);
  }

  async function deleteTask(task: Task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    const supabase = getSupabaseClient();
    await supabase.from("tasks").delete().eq("id", task.id);
  }

  const todoTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const ordered = [...todoTasks, ...doneTasks];

  return (
    <div>
      <p className="eyebrow mb-3">Project</p>
      <h1 className="font-display text-3xl md:text-4xl mb-10 break-words">
        {loading ? "…" : projectName}
      </h1>

      {loading ? (
        <p className="text-sm text-[color:var(--ink-faint)] mb-8">Loading…</p>
      ) : (
        <div className="flex flex-col gap-2.5 mb-8">
          {tasks.length === 0 && (
            <p className="text-sm text-[color:var(--ink-faint)]">
              No tasks yet — add your first one below.
            </p>
          )}
          {ordered.map((task) => (
            <div
              key={task.id}
              className="rounded-xl px-4 py-3 flex items-start gap-3"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}
            >
              <button
                onClick={() => toggleDone(task)}
                aria-label={task.status === "done" ? "Mark not done" : "Mark done"}
                className="h-5 w-5 mt-0.5 rounded-md shrink-0 flex items-center justify-center"
                style={{
                  background: task.status === "done" ? "var(--green)" : "transparent",
                  border: `1.5px solid ${task.status === "done" ? "var(--green)" : "var(--line-strong)"}`,
                }}
              >
                {task.status === "done" && <span style={{ color: "#fff", fontSize: "12px", lineHeight: 1 }}>✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[15px]"
                  style={{
                    textDecoration: task.status === "done" ? "line-through" : "none",
                    color: task.status === "done" ? "var(--ink-faint)" : "var(--ink)",
                  }}
                >
                  {task.title}
                </p>
                {task.notes && (
                  <p className="text-xs text-[color:var(--ink-faint)] mt-1 leading-relaxed">{task.notes}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  <span
                    className="text-[11px] uppercase tracking-wide font-mono-brand"
                    style={{ color: PRIORITY_COLOR[task.priority] }}
                  >
                    {task.priority}
                  </span>
                  {task.due_date && (
                    <span className="text-[11px] text-[color:var(--ink-faint)] font-mono-brand tabular">
                      due {task.due_date}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task)}
                aria-label="Delete task"
                className="text-xs text-[color:var(--ink-faint)] hover:text-[color:var(--ink)] transition-colors shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <form onSubmit={addTask} className="card p-5 flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            autoFocus
            className="rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="rounded-lg px-3.5 py-2.5 text-[14px] outline-none resize-none"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
          />
          <div className="flex gap-3 flex-wrap">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--line-strong)" }}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating || !title.trim()}
              className="btn-accent rounded-full px-5 py-2.5 text-sm disabled:opacity-60"
            >
              {creating ? "Adding…" : "Add task"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost rounded-full px-5 py-2.5 text-sm">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)} className="btn-ghost rounded-full px-5 py-2.5 text-sm">
          + Add task
        </button>
      )}
    </div>
  );
}
