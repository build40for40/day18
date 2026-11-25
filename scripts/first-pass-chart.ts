// npm run chart:first-pass: writes src/data/crossover.json from Samira's first-pass scores.
// No API calls. Replace with `npm run score` once the full pull exists.
import { mkdir, readFile, writeFile } from 'node:fs/promises'

import { chartRows, parseCsv } from './first-pass.ts'

const SOURCE = 'research/guardian-crossover-scores.csv'
const rows = parseCsv(await readFile(SOURCE, 'utf8'))
const people = chartRows(rows)
const truncated = rows.filter((r) => r.truncated_at_1000 === 'Y' && r.other_sections !== '').length

const chart = {
  title: 'The Crossover 100',
  window: { from: '2025-11-25', to: '2026-11-25' },
  generatedAt: new Date().toISOString(),
  note: `First pass: ${people.length} of ${rows.length} people scored so far. The rest have no Guardian tag or no usable articles yet.`,
  method: [
    "Everyone is from Semrush's most searched living people, checked against 12 months of Guardian coverage.",
    'We only count articles the Guardian has tagged as being about them, not passing mentions.',
    'Your home section is where the Guardian writes about you most.',
    'A crossover is any other section with at least one article about you. Opinion pieces don\'t count, and football counts as sport.',
    'Most crossovers wins. Ties go to whoever has more coverage outside their home section.',
    'Politicians and royals pop up across news sections because they are the news, which is not quite the same as crossing over.',
    ...(truncated ? ['Donald Trump\'s pull stopped early, so his numbers are a floor.'] : []),
  ],
  people,
}

await mkdir('src/data', { recursive: true })
await writeFile('src/data/crossover.json', JSON.stringify(chart, null, 2) + '\n')
console.log(`Ranked ${people.length} people from ${SOURCE} into src/data/crossover.json.`)
