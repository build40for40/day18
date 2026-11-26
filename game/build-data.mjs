// Builds game/people.json for Fame vs Reach from the research files.
// Run from the repo root: node game/build-data.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const csv = readFileSync(join(root, "research/semrush-top-100-people.csv"), "utf8");
const index = JSON.parse(readFileSync(join(root, "research/crossover-index.json"), "utf8"));

// Groups we keep out of a game about creators and crossover.
const EXCLUDED_GROUPS = new Set(["deceased", "politician", "royal", "ambiguous term"]);

// Names the CSV lowercases that title case alone gets wrong.
const DISPLAY_NAMES = {
  "timothee chalamet": "Timothée Chalamet",
  beyonce: "Beyoncé",
  mrbeast: "MrBeast",
  "paul mccartney": "Paul McCartney",
  "robert de niro": "Robert De Niro",
  "leonardo dicaprio": "Leonardo DiCaprio",
  "ana de armas": "Ana de Armas",
  "lebron james": "LeBron James",
};

const normalise = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const titleCase = (s) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());

function parseVolume(band) {
  const m = /^([\d.]+)([KM])$/.exec(band.trim());
  if (!m) throw new Error(`Unreadable search volume: ${band}`);
  return Math.round(Number(m[1]) * (m[2] === "M" ? 1_000_000 : 1_000));
}

// Instagram followers for the people the crossover seed covers.
const followers = new Map(
  index.seed.people.map((p) => [normalise(p.name), p.followers_millions]),
);

// Crossover breadth, once the tag-based press pull fills it in.
const breadth = new Map(
  (index.press_counts_12_months.results ?? [])
    .filter((r) => typeof r.breadth === "number")
    .map((r) => [normalise(r.name), r.breadth]),
);

const rows = csv.trim().split(/\r?\n/).slice(1);
const people = [];
const dropped = [];

for (const row of rows) {
  const [rank, term, band, group, inSeed] = row.split(",").map((c) => c.trim());
  if (inSeed !== "yes" || EXCLUDED_GROUPS.has(group)) {
    dropped.push(`${term} (${group || "not in seed"})`);
    continue;
  }
  const key = normalise(term);
  people.push({
    id: key.replace(/\s+/g, "-"),
    name: DISPLAY_NAMES[key] ?? titleCase(term),
    rank: Number(rank),
    searches: parseVolume(band),
    searchesLabel: band,
    followersMillions: followers.get(key) ?? null,
    breadth: breadth.get(key) ?? null,
  });
}

const out = {
  generated: new Date().toISOString().slice(0, 10),
  sources: {
    searches: "Semrush Most Popular People, Google monthly global searches, page dated March 2026",
    followers: index.seed.source,
    breadth: "Guardian Content API, sections with 3+ articles outside the home section",
  },
  people,
};

writeFileSync(join(root, "game/people.json"), JSON.stringify(out, null, 2) + "\n");

const bands = new Set(people.map((p) => p.searches)).size;
console.log(`Wrote ${people.length} people across ${bands} search bands.`);
console.log(`With followers: ${people.filter((p) => p.followersMillions).length}`);
console.log(`With breadth: ${people.filter((p) => p.breadth !== null).length}`);
console.log(`Dropped ${dropped.length}: ${dropped.join(", ")}`);
