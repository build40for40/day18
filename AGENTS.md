# Day 18

Day 18 of 40 for 40, built live on Twitch on Wednesday 25 November 2026. The problem is "Ranking creator influence globally", from Nicole. Work is tracked on the Superthread `day18` board and the "Day 18" page.

- **Form factor:** a web app (from the jar's web app, browser extension and game), served at https://build40for40.com/crossover/ (it was /day18/ earlier, which now redirects). A game on the same data may follow.
- **Name:** TBC. The repo stays `day18` until the app has a name, then it's renamed and served at `build40for40.com/<app>/`.

Shared 40 for 40 context lives in `../AGENTS.md`.

## Stack

- Vue 3 with `<script setup lang="ts">`, built with Vite, from the kit's `templates/web-app`. The Claude demo and fake API were removed.
- Vitest with jsdom and `@vue/test-utils`. Tests sit next to their source as `*.test.ts`. Tests for Node code start with `// @vitest-environment node`.
- `@/` resolves to `src/`.
- The Worker in `worker/` redirects the old `/day18` addresses to `/crossover` and answers 404 under `/crossover/api/*`. Everything else under `/crossover/` is a static file from `dist/crossover/`.
- The data scripts in `scripts/` are plain TypeScript run by Node (24, or 22.18+) with no extra packages.

## Commands

- `npm run dev`: the page at http://localhost:5173/crossover/.
- `npm test`: unit tests.
- `npm run build`: type-check with `vue-tsc`, then build to `dist/crossover/`.
- `npm run sections`: saves every Guardian section to `research/guardian-sections.json`. 1 API call.
- `npm run pull`: Guardian coverage for everyone in the Semrush seed, to `research/guardian-counts.json`. 1 call a second, cached in `data/cache/` (gitignored), stops at 450 calls (`GUARDIAN_BUDGET` to change it) and carries on from the cache next run.
- `npm run score`: ranks `research/guardian-counts.json` into `src/data/crossover.json`. No API calls. The rules are constants at the top of `scripts/score.ts`.
- `npm run deploy`, and wrangler as `npm run wrangler -- <args>`, never `npx wrangler`.

The Guardian scripts need `GUARDIAN_API_KEY` in a local `.env` (copy `.env.example`). It's Samira's personal developer key: non-commercial use only, 1 call a second, 500 a day. Never commit it, and never log request URLs, since they hold the key.

## Hosting

- A Cloudflare Worker named `day18` serves `dist/` on the `build40for40.com/crossover` and `build40for40.com/crossover/*` routes, and keeps the `/day18` routes so old links redirect.
- CI (`.github/workflows/ci.yml`) tests and builds every push and PR. Pushes to `main` deploy, PRs get a preview link. Deploys need the `CLOUDFLARE_API_TOKEN` repo secret.

## The problem

Ranking creator influence globally

I want to build a global FTSE 100 for content creators — a live intelligence and ranking platform that identifies and tracks the world’s most influential digital personalities across all major social media platforms, including Instagram, TikTok, YouTube, X, Facebook and emerging platforms. The aim is to understand who owns the most digital real estate and influence globally, measuring not just followers but engagement, audience quality, cultural relevance and real-world human interactions (rather than AI-generated activity). The platform would rank creators by overall influence, with live leaderboards broken down by geographical regions (EMEA, Africa, North America, etc.) and sectors such as lifestyle, business, music, sport and entertainment. Essentially, it would combine the authority and market intelligence of the FTSE 100 with the real-time popularity rankings of the Billboard Top 100, creating a definitive global index of who has the most influence, where that influence sits, and

(The text on the site stops here.)

## What we're building

**The Crossover 100**: the people the Guardian couldn't keep in one section, ranked by how many sections they crossed into over the last 12 months.

1. Seed: `research/final-100.csv`, the final 100 (84 from Semrush's most searched people, 16 hand-picked). `npm run pull` reads it; `research/guardian-counts.json` is currently built from the cached pull, so the page matches `final-100.md`.
2. Pull: each person's Guardian articles from 25 Nov 2025 to 25 Nov 2026, matched by the Guardian's own tag for them, or an exact name search when there's no tag. Count articles per section.
3. Score (Samira's method, `scripts/scoring.ts`): home section is the one with the most articles. Crossovers are other sections with at least 1 article (5 for a name search), with football counted as sport and the opinion section ignored. Rank by crossovers, then outside share, then name. Volume is shown but doesn't score.
4. Page: rank, name and crossovers, with the top three as hero cards. Tap a row to see home, articles, outside share and each section crossed into. Search by name.

Cut for now: regions, sector leaderboards, social platforms, niche fashion pockets, movement arrows, photos.

## Decided

- Samira owns the data and scoring, and the page only shows what `src/data/crossover.json` says. It never re-ranks.
- `src/data/crossover.json` needs `rank`, `name` and `crossovers` for each person. `home`, `articles`, `outsideShare`, `sections`, `method` and `window` are optional, and the page hides what's missing. `src/chart/schema.ts` checks it at build time.
- Until that file exists, the page shows `src/data/crossover.sample.json` (100 made-up people) with a sample data banner.
- Window: the rolling 12 months from 25 Nov 2025 to 25 Nov 2026.
- Every Guardian section counts. `RULES.ignore` in `scripts/score.ts` can drop network or regional ones later.
- The look is our own: no TIME, Billboard or FTSE branding.
