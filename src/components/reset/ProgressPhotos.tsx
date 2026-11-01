"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Photo = { path: string; url: string; takenAt: Date };

const BUCKET = "progress-photos";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function daysAgo(date: Date, now: number) {
  const diff = now - date.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function ProgressPhotos() {
  const [now] = useState(() => Date.now());
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const { data: files } = await supabase.storage
      .from(BUCKET)
      .list(user.id, { sortBy: { column: "name", order: "desc" } });

    const list = files ?? [];
    const withUrls = await Promise.all(
      list.map(async (f) => {
        const path = `${user.id}/${f.name}`;
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
        const ts = parseInt(f.name.split(".")[0], 10);
        return { path, url: signed?.signedUrl ?? "", takenAt: new Date(Number.isFinite(ts) ? ts : Date.now()) };
      })
    );
    setPhotos(withUrls.filter((p) => p.url));
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);

    if (uploadError) {
      setError("Couldn't upload that photo. Try again.");
    } else {
      await load();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function removePhoto(path: string) {
    const supabase = getSupabaseClient();
    await supabase.storage.from(BUCKET).remove([path]);
    setPhotos((prev) => prev.filter((p) => p.path !== path));
  }

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-[color:var(--ink-faint)]">Loading…</p>
      </div>
    );
  }

  const latest = photos[0];
  const isDue = !latest || now - latest.takenAt.getTime() >= WEEK_MS;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="eyebrow">Weekly progress photo</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-ghost rounded-full px-4 py-2 text-xs"
        >
          {uploading ? "Uploading…" : "Add photo"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleUpload} className="hidden" />
      </div>

      {error && <p className="text-xs text-[color:var(--ink-faint)] mb-3">{error}</p>}

      {isDue && (
        <p
          className="text-xs rounded-lg px-3 py-2 mb-4"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--accent)", color: "var(--ink-dim)" }}
        >
          {latest ? `Last photo was ${daysAgo(latest.takenAt, now)} — time for a new one.` : "No photos yet — add your first check-in."}
        </p>
      )}

      {photos.length === 0 ? (
        <p className="text-sm text-[color:var(--ink-faint)]">
          Add a photo once a week to track visual progress over time. Only you can see these.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map((p) => (
            <div key={p.path} className="flex flex-col gap-1">
              <div className="relative rounded-lg overflow-hidden" style={{ border: "1px solid var(--line)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={`Progress photo from ${p.takenAt.toLocaleDateString()}`} className="w-full aspect-square object-cover" />
                <button
                  onClick={() => removePhoto(p.path)}
                  className="absolute top-1 right-1 rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                  style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
              <span className="text-[11px] text-[color:var(--ink-faint)] font-mono-brand tabular">
                {p.takenAt.toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
