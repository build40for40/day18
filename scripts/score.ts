// npm run score: turns research/guardian-counts.json into the chart at src/data/crossover.json.
// No API calls, so tweak the rules below and rerun as often as you like.
import { mkdir, readFile, writeFile } from 'node:fs/promises'

import { rankPeople, type PersonCounts, type ScoreRules } from './scoring.ts'

const RULES: ScoreRules = {
  // a phrase search also catches passing mentions, so it needs more articles to count
  threshold: { tag: 3, phrase: 5 },
  // e.g. ['commentisfree', 'global'] to stop network or regional sections counting
  ignore: [],
  top: 100,
}

const counts = JSON.parse(await readFile('research/guardian-counts.json', 'utf8')) as {
  window: { from: string; to: string }
  complete: boolean
  sectionNames: Record<string, string>
  people: PersonCounts[]
}

let titles = counts.sectionNames
try {
  const all = JSON.parse(await readFile('research/guardian-sections.json', 'utf8')) as {
    sections: { id: string; title: string }[]
  }
  titles = { ...titles, ...Object.fromEntries(all.sections.map((s) => [s.id, s.title])) }
} catch {
  // no sections file yet, so section names from the pull will do
}
const title = (id: string) => titles[id] ?? id

const chart = {
  title: 'The Crossover 100',
  window: counts.window,
  generatedAt: new Date().toISOString(),
  method: [
    `Everyone is from Semrush's most searched people, checked against 12 months of Guardian coverage.`,
    `Your home section is where the Guardian writes about you most.`,
    `A crossover is any other section with at least ${RULES.threshold.tag} articles about you (${RULES.threshold.phrase} when we matched your name rather than a Guardian tag).`,
    `Most crossovers wins. Ties go to whoever has more coverage outside their home section.`,
    `How much coverage you get doesn't count, so fame alone can't win.`,
  ],
  people: rankPeople(counts.people, RULES).map(({ crossed, home, ...person }) => ({
    ...person,
    home: title(home),
    sections: crossed.map(({ id, articles }) => ({ id, title: title(id), articles })),
  })),
}

await mkdir('src/data', { recursive: true })
await writeFile('src/data/crossover.json', JSON.stringify(chart, null, 2) + '\n')
console.log(
  `Ranked ${chart.people.length} people into src/data/crossover.json.` +
    (counts.complete ? '' : ' The pull was not complete, so this is a partial chart.'),
)
