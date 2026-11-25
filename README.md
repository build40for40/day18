# The Crossover 100

A 40 for 40 app: the people the Guardian couldn't keep in one section, ranked by how many sections they crossed into over the last 12 months. Built with Vue 3, TypeScript and Vite, and served by a Cloudflare Worker.

## Today: Day 18

Nicole wants a FTSE 100 for influence. We start with crossover: someone is influential when the press can't keep them in their own lane.

1. **Seed.** Semrush's most searched people.
2. **Pull.** 12 months of Guardian coverage for each, counted by section.
3. **Rank.** Most crossovers wins, ties go to coverage outside their home section.

## Develop

```sh
npm install
npm run dev        # http://localhost:5173/crossover/, with sample data until the real chart exists
```

## Data

```sh
cp .env.example .env   # then add your Guardian developer key
npm run sections       # every Guardian section, 1 call
npm run pull           # Guardian coverage per person, cached and resumable
npm run score          # writes src/data/crossover.json
```

## Check

```sh
npm test
npm run build
```

## Deploy

Live at https://build40for40.com/crossover/ (the old /day18/ address redirects there). Merging to `main` deploys it, and every pull request gets a public preview link.
