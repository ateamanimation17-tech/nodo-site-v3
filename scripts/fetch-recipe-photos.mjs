// One-time content script: downloads a real food photo per recipe from
// Pixabay (free stock photo API — Pexels' key issuance is paused as of
// Nov 2026, so we use Pixabay instead) and saves it into
// public/recipe-photos/, then writes the local photoUrl straight into
// src/lib/recipes.ts. Pixabay's terms don't allow permanent hotlinking
// of their URLs, so the image is downloaded and self-hosted rather
// than linked directly.
//
// Usage (from the app/ directory):
//   PIXABAY_API_KEY=your_key_here node scripts/fetch-recipe-photos.mjs
//
// Get a free key at https://pixabay.com/api/docs/ (sign up, the key is
// shown on that page once logged in).
//
// Re-run any time you add a new recipe — add its id + search query to
// RECIPE_QUERIES below first. Existing photos are refreshed.

import { readFile, writeFile, mkdir } from "node:fs/promises";

const API_KEY = process.env.PIXABAY_API_KEY;
if (!API_KEY) {
  console.error("Missing PIXABAY_API_KEY. Run with: PIXABAY_API_KEY=your_key node scripts/fetch-recipe-photos.mjs");
  process.exit(1);
}

// id must match a Recipe.id in src/lib/recipes.ts
const RECIPE_QUERIES = [
  { id: "greek-yogurt-power-bowl", query: "greek yogurt berry bowl" },
  { id: "veggie-egg-scramble", query: "egg scramble vegetables" },
  { id: "protein-oats", query: "oatmeal bowl banana" },
  { id: "smoked-salmon-toast", query: "smoked salmon toast" },
  { id: "cottage-cheese-pancakes", query: "pancakes stack" },
  { id: "chicken-quinoa-bowl", query: "grilled chicken quinoa bowl" },
  { id: "turkey-avocado-wrap", query: "turkey avocado wrap" },
  { id: "tuna-pasta-salad", query: "tuna pasta salad" },
  { id: "beef-sweet-potato-skillet", query: "beef sweet potato skillet" },
  { id: "baked-salmon-veg", query: "baked salmon vegetables" },
  { id: "chicken-stir-fry", query: "chicken stir fry" },
  { id: "lentil-veg-curry", query: "lentil vegetable curry" },
  { id: "turkey-meatballs-zoodles", query: "turkey meatballs zucchini noodles" },
  { id: "protein-shake-almonds", query: "protein shake almonds" },
  { id: "cottage-cheese-pineapple", query: "cottage cheese pineapple" },
];

const OUT_DIR = new URL("../public/recipe-photos/", import.meta.url);
await mkdir(OUT_DIR, { recursive: true });

async function fetchAndSavePhoto({ id, query }) {
  const searchUrl =
    `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(query)}` +
    `&image_type=photo&orientation=horizontal&category=food&safesearch=true&per_page=3`;

  const res = await fetch(searchUrl);
  if (!res.ok) {
    console.warn(`  ✗ ${id}: Pixabay search returned ${res.status}`);
    return null;
  }
  const data = await res.json();
  const hit = data.hits?.[0];
  if (!hit) {
    console.warn(`  ✗ ${id}: no results for "${query}"`);
    return null;
  }

  const imageRes = await fetch(hit.largeImageURL);
  if (!imageRes.ok) {
    console.warn(`  ✗ ${id}: failed to download image (${imageRes.status})`);
    return null;
  }
  const bytes = Buffer.from(await imageRes.arrayBuffer());
  const filename = `${id}.jpg`;
  await writeFile(new URL(filename, OUT_DIR), bytes);

  console.log(`  ✓ ${id}: saved (${(bytes.length / 1024).toFixed(0)}KB, by ${hit.user} on Pixabay)`);
  return `/recipe-photos/${filename}`;
}

const RECIPES_PATH = new URL("../src/lib/recipes.ts", import.meta.url);
let source = await readFile(RECIPES_PATH, "utf8");
let updated = 0;

for (const entry of RECIPE_QUERIES) {
  const photoUrl = await fetchAndSavePhoto(entry);
  await new Promise((r) => setTimeout(r, 400)); // stay well under Pixabay's 100 req/60s limit
  if (!photoUrl) continue;

  const idLine = `id: "${entry.id}",`;
  const idIndex = source.indexOf(idLine);
  if (idIndex === -1) {
    console.warn(`  ✗ ${entry.id}: not found in recipes.ts`);
    continue;
  }

  const afterId = idIndex + idLine.length;
  const existingPhotoMatch = source.slice(afterId, afterId + 200).match(/\n(\s*)photoUrl: "[^"]*",/);
  if (existingPhotoMatch) {
    const start = afterId + existingPhotoMatch.index;
    source = source.slice(0, start) + source.slice(start + existingPhotoMatch[0].length);
  }

  const indentMatch = source.slice(0, idIndex).match(/\n(\s*)$/);
  const indent = indentMatch ? indentMatch[1] : "    ";
  const insertion = `\n${indent}photoUrl: "${photoUrl}",`;
  source = source.slice(0, afterId) + insertion + source.slice(afterId);
  updated++;
}

await writeFile(RECIPES_PATH, source);
console.log(`\nUpdated photoUrl for ${updated}/${RECIPE_QUERIES.length} recipes in src/lib/recipes.ts.`);
console.log("Images saved under public/recipe-photos/ — commit them along with recipes.ts.");
