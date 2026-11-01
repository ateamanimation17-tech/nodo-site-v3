// One-time content script: finds one real, embeddable YouTube tutorial
// per exercise via the YouTube Data API v3, and writes the videoId
// straight into src/lib/workoutPrograms.ts next to each exercise.
// Nothing is guessed — every id comes from a live search result.
//
// Usage (from the app/ directory):
//   YOUTUBE_API_KEY=your_key_here node scripts/fetch-exercise-videos.mjs
//
// Re-run any time you add a new exercise — add its name to
// EXERCISE_NAMES below first. Existing videoId values are refreshed.

import { readFile, writeFile } from "node:fs/promises";

const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) {
  console.error("Missing YOUTUBE_API_KEY. Run with: YOUTUBE_API_KEY=your_key node scripts/fetch-exercise-videos.mjs");
  process.exit(1);
}

// Must match the exercise `name` values in src/lib/workoutPrograms.ts
const EXERCISE_NAMES = [
  "Back Squat",
  "Barbell Back Squat",
  "Bench Press",
  "Bent-Over Row",
  "Bicep Curl",
  "Cable Row",
  "Deadlift",
  "Dumbbell Shoulder Press",
  "Face Pull",
  "Front Squat",
  "Hammer Curl",
  "Hanging Leg Raise",
  "Hip Thrust",
  "Incline Bench Press",
  "Incline Dumbbell Press",
  "Lat Pulldown",
  "Lateral Raise",
  "Leg Curl",
  "Leg Extension",
  "Leg Press",
  "Overhead Press",
  "Overhead Tricep Extension",
  "Plank",
  "Pull-Up",
  "Pull-Up / Lat Pulldown",
  "Romanian Deadlift",
  "Seated Cable Row",
  "Seated Calf Raise",
  "Seated Dumbbell Shoulder Press",
  "Seated Row",
  "Side Plank",
  "Standing Calf Raise",
  "Tricep Pushdown",
  "Walking Lunge",
];

function searchQueryFor(name) {
  return `${name.replace("/", " or ")} proper form tutorial`;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchVideoId(name) {
  const q = searchQueryFor(name);
  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video` +
    `&maxResults=1&videoEmbeddable=true&safeSearch=strict` +
    `&q=${encodeURIComponent(q)}&key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    console.warn(`  ✗ ${name}: YouTube API returned ${res.status} — ${body.slice(0, 200)}`);
    return null;
  }
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) {
    console.warn(`  ✗ ${name}: no results for "${q}"`);
    return null;
  }
  console.log(`  ✓ ${name}: ${item.snippet.title} (${item.snippet.channelTitle})`);
  return item.id.videoId;
}

const PROGRAMS_PATH = new URL("../src/lib/workoutPrograms.ts", import.meta.url);
let source = await readFile(PROGRAMS_PATH, "utf8");
let updated = 0;

for (const name of EXERCISE_NAMES) {
  const videoId = await fetchVideoId(name);
  await new Promise((r) => setTimeout(r, 200));
  if (!videoId) continue;

  const escaped = escapeRegExp(name);
  const pattern = new RegExp(
    `(\\{ name: "${escaped}", sets: \\d+, reps: "[^"]*")(?:, videoId: "[^"]*")?( \\})`,
    "g"
  );
  const before = source;
  source = source.replace(pattern, `$1, videoId: "${videoId}"$2`);
  if (source !== before) updated++;
  else console.warn(`  ✗ ${name}: no matching exercise entries found in workoutPrograms.ts`);
}

await writeFile(PROGRAMS_PATH, source);
console.log(`\nUpdated videoId for ${updated}/${EXERCISE_NAMES.length} exercises in src/lib/workoutPrograms.ts.`);
