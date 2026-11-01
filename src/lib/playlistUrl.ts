export type ParsedPlaylist = { platform: "spotify" | "youtube"; embedUrl: string };

export function parsePlaylistUrl(raw: string): ParsedPlaylist | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  // Spotify: open.spotify.com/playlist/{id} or /album/{id} or /track/{id}
  if (url.hostname.includes("open.spotify.com")) {
    const match = url.pathname.match(/\/(playlist|album|track)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    const [, kind, id] = match;
    return { platform: "spotify", embedUrl: `https://open.spotify.com/embed/${kind}/${id}` };
  }

  // YouTube playlist: youtube.com/playlist?list={id}
  if (url.hostname.includes("youtube.com") && url.pathname === "/playlist") {
    const list = url.searchParams.get("list");
    if (!list) return null;
    return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/videoseries?list=${list}` };
  }

  // YouTube video (optionally with a list param): youtube.com/watch?v={id}
  if (url.hostname.includes("youtube.com") && url.pathname === "/watch") {
    const v = url.searchParams.get("v");
    const list = url.searchParams.get("list");
    if (list) return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/videoseries?list=${list}` };
    if (v) return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${v}` };
    return null;
  }

  // Shortened YouTube: youtu.be/{id}
  if (url.hostname.includes("youtu.be")) {
    const id = url.pathname.slice(1);
    if (!id) return null;
    return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` };
  }

  return null;
}
