// npm run pull: 12 months of Guardian coverage for everyone in the Semrush seed list.
// Writes research/guardian-counts.json. Safe to rerun: cached calls are free, and a run that
// hits the budget saves what it has and carries on from there next time.
import { readFile, writeFile } from 'node:fs/promises'

import { apiKey, BudgetSpent, createClient } from './guardian.ts'
import type { Match, PersonCounts } from './scoring.ts'

const SEED = 'research/semrush-living-seed-100.csv'
const OUT = 'research/guardian-counts.json'
const FROM = '2025-11-25'
const TO = '2026-11-25'
const BUDGET = Number(process.env.GUARDIAN_BUDGET ?? 450)
const PAGE_SIZE = 200

interface Tag { id: string; webTitle: string; type: string }
interface Article { sectionId: string; sectionName: string }
interface SearchResponse { total: number; pages: number; results: Article[] }

const client = createClient(apiKey(), BUDGET)

const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
const titleCase = (s: string) => s.replace(/(^|[\s-])\p{L}/gu, (m) => m.toUpperCase())

function readSeed(csv: string) {
  const [header, ...lines] = csv.trim().split(/\r?\n/)
  const cols = header!.split(',').map((c) => c.trim())
  return lines
    .map((line) => Object.fromEntries(line.split(',').map((v, i) => [cols[i], v.trim()])))
    .filter((row) => row.in_seed === 'yes')
    .map((row) => ({ seedRank: Number(row.rank), term: row.search_term! }))
}

/** The Guardian's own tag for a person, when its title matches the name exactly. */
async function findTag(term: string): Promise<Tag | undefined> {
  const tags = await client.get<{ results: Tag[] }>('/tags', { q: term, type: 'keyword', 'page-size': 20 })
  return tags.results.find((tag) => fold(tag.webTitle) === fold(term))
}

async function countSections(params: Record<string, string>) {
  const sections: Record<string, number> = {}
  const names: Record<string, string> = {}
  let articles = 0
  for (let page = 1; ; page++) {
    const res = await client.get<SearchResponse>('/search', {
      ...params, 'from-date': FROM, 'to-date': TO, 'page-size': PAGE_SIZE, page,
    })
    for (const { sectionId, sectionName } of res.results) {
      sections[sectionId] = (sections[sectionId] ?? 0) + 1
      names[sectionId] = sectionName
      articles++
    }
    if (page >= res.pages) break
  }
  return { sections, names, articles }
}

const seed = readSeed(await readFile(SEED, 'utf8'))
const people: PersonCounts[] = []
const sectionNames: Record<string, string> = {}
let stopped = ''

for (const { seedRank, term } of seed) {
  try {
    const tag = await findTag(term)
    const match: Match = tag ? 'tag' : 'phrase'
    const params: Record<string, string> = tag ? { tag: tag.id } : { q: `"${term}"` }
    const { sections, names, articles } = await countSections(params)
    Object.assign(sectionNames, names)
    people.push({
      seedRank,
      name: tag?.webTitle ?? titleCase(term),
      match: articles ? match : 'none',
      ...(tag && { tag: tag.id }),
      articles,
      sections,
    })
    console.log(`${String(seedRank).padStart(3)} ${term}: ${articles} articles via ${match}, ${Object.keys(sections).length} sections`)
  } catch (error) {
    if (!(error instanceof BudgetSpent)) throw error
    stopped = `${error.message} Got through ${people.length} of ${seed.length}; rerun tomorrow to carry on.`
    break
  }
}

await writeFile(
  OUT,
  JSON.stringify(
    {
      window: { from: FROM, to: TO },
      pulledAt: new Date().toISOString(),
      complete: !stopped,
      seed: SEED,
      sectionNames,
      people,
    },
    null,
    2,
  ) + '\n',
)
console.log(stopped || `Done: ${people.length} people.`, `${client.calls()} new calls. Saved ${OUT}.`)
