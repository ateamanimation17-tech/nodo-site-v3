"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { parsePlaylistUrl } from "@/lib/playlistUrl";

type Playlist = { id: string; label: string; url: string };

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };

export default function WorkoutMusic() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

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
    const { data } = await supabase
      .from("workout_playlists")
      .select("id, label, url")
      .eq("user_id", user.id)
      .order("position", { ascending: true });
    const list = (data as Playlist[]) ?? [];
    setPlaylists(list);
    setActiveId((prev) => prev ?? list[0]?.id ?? null);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function addPlaylist() {
    const parsed = parsePlaylistUrl(url);
    if (!parsed) {
      setError("That doesn't look like a Spotify or YouTube playlist link.");
      return;
    }
    setError(null);
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error: insertError } = await supabase
      .from("workout_playlists")
      .insert({ user_id: user.id, label: label.trim() || "Workout mix", url: url.trim(), position: playlists.length })
      .select("id, label, url")
      .single();

    if (insertError) {
      setError("Couldn't save that playlist. Try again.");
      return;
    }
    const added = data as Playlist;
    setPlaylists((prev) => [...prev, added]);
    setActiveId(added.id);
    setLabel("");
    setUrl("");
    setShowAdd(false);
  }

  async function removePlaylist(id: string) {
    const supabase = getSupabaseClient();
    await supabase.from("workout_playlists").delete().eq("id", id);
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }

  if (loading) return null;

  const active = playlists.find((p) => p.id === activeId) ?? null;
  const activeEmbed = active ? parsePlaylistUrl(active.url) : null;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="eyebrow">Workout music</p>
        <button onClick={() => setShowAdd((v) => !v)} className="btn-ghost rounded-full px-4 py-2 text-xs">
          {showAdd ? "Cancel" : "Add playlist"}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl p-4 mb-4 flex flex-col gap-2" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
          <p className="text-xs text-[color:var(--ink-faint)]">
            Paste a Spotify or YouTube playlist link — copy it from the Share menu in either app.
          </p>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Name it, e.g. Leg day"
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://open.spotify.com/playlist/..."
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          {error && <p className="text-xs text-[color:var(--ink-faint)]">{error}</p>}
          <button onClick={addPlaylist} className="btn-ghost rounded-md px-4 py-2 text-xs self-start">
            Save
          </button>
        </div>
      )}

      {playlists.length === 0 ? (
        <p className="text-sm text-[color:var(--ink-faint)]">
          No playlists yet. Add a Spotify or YouTube link to play music during your session.
        </p>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap mb-4">
            {playlists.map((p) => (
              <div key={p.id} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveId(p.id)}
                  className="rounded-full px-4 py-2 text-sm transition-colors"
                  style={{
                    border: `1px solid ${p.id === activeId ? "var(--accent)" : "var(--line-strong)"}`,
                    color: p.id === activeId ? "var(--ink)" : "var(--ink-dim)",
                  }}
                >
                  {p.label}
                </button>
                <button
                  onClick={() => removePlaylist(p.id)}
                  className="btn-ghost rounded-full px-2 py-1.5 text-xs"
                  aria-label={`Remove ${p.label}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {activeEmbed && (
            <iframe
              key={activeEmbed.embedUrl}
              src={activeEmbed.embedUrl}
              width="100%"
              height={activeEmbed.platform === "spotify" ? 352 : 220}
              style={{ borderRadius: "12px", border: "none" }}
              allow="autoplay; encrypted-media; fullscreen"
              loading="lazy"
            />
          )}
        </>
      )}
    </div>
  );
}
