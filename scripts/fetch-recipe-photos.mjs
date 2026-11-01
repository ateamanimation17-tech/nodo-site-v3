// One-time content script: fetches a real food photo per recipe from
// Pexels (free stock photo API) and writes the photoUrl straight into
// src/lib/recipes.ts, next to each recipe's `id` field.
//
// Usage (from the app/ directory):
//   PEXELS_API_KEY=your_key_here node scripts/fetch-recipe-photos.mjs
//
// Re-run any time you add a new recipe — add its id + search query to
// RECIPE_QUERIES below first. Existing photoUrl values are refreshed.

import { readFile, writeFile } from "node:fs/promises";

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  console.error("Missing PEXELS_API_KEY. Run with: PEXELS_API_KEY=your_key node scripts/fetch-recipe-photos.mjs");
  process.exit(1);
}

// id must match a Recipe.id in src/lib/recipes.ts
const RECIPE_QUERIES = [
  { id: "greek-yogurt-power-bowl", query: "greek yogurt berry bowl breakfast" },
  { id: "veggie-egg-scramble", query: "egg scramble vegetables breakfast" },
  { id: "protein-oats", query: "oatmeal bowl banana peanut butter" },
  { id: "smoked-salmon-toast", query: "smoked salmon toast breakfast" },
  { id: "cottage-cheese-pancakes", query: "pancakes stack breakfast" },
  { id: "chicken-quinoa-bowl", query: "grilled chicken quinoa bowl" },
  { id: "turkey-avocado-wrap", query: "turkey avocado wrap sandwich" },
  { id: "tuna-pasta-salad", query: "tuna pasta salad" },
  { id: "beef-sweet-potato-skillet", query: "ground beef sweet potato skillet" },
  { id: "baked-salmon-veg", query: "baked salmon vegetables plate" },
  { id: "chicken-stir-fry", query: "chicken stir fry vegetables" },
  { id: "lentil-veg-curry", query: "lentil vegetable curry bowl" },
  { id: "turkey-meatballs-zoodles", query: "turkey meatballs zucchini noodles" },
  { id: "protein-shake-almonds", query: "protein shake almonds smoothie" },
  { id: "cottage-cheese-pineapple", query: "cottage cheese pineapple bowl" },
];

async function fetchPhotoUrl({ id, query }) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  if (!res.ok) {
    console.warn(`  ✗ ${id}: Pexels returned ${res.status}`);
    return null;
  }
  const data = await res.json();
  const photo = data.photos?.[0];
  if (!photo) {
    console.warn(`  ✗ ${id}: no results for "${query}"`);
    return null;
  }
  console.log(`  ✓ ${id}: ${photo.url}`);
  return photo.src.large;
}

const RECIPES_PATH = new URL("../src/lib/recipes.ts", import.meta.url);
let source = await readFile(RECIPES_PATH, "utf8");
let updated = 0;

for (const entry of RECIPE_QUERIES) {
  const photoUrl = await fetchPhotoUrl(entry);
  await new Promise((r) => setTimeout(r, 300)); // be polite to the free tier rate limit
  if (!photoUrl) continue;

  const idLine = `id: "${entry.id}",`;
  const idIndex = source.indexOf(idLine);
  if (idIndex === -1) {
    console.warn(`  ✗ ${entry.id}: not found in recipes.ts`);
    continue;
  }

  // Remove any existing photoUrl line for this recipe (between this id and the next field)
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
