// Turns Samira's first-pass scores (research/guardian-crossover-scores.csv) into the page's
// chart rows. Her method: rank by other_sections, then outside_pct, then name.
// People with no score (no Guardian tag, or no usable articles) are left out.

export interface ScoreRow {
  semrush_rank: string
  person: string
  articles_12m: string
  home_section: string
  other_sections: string
  outside_pct: string
  truncated_at_1000: string
}

const SECTION_TITLES: Record<string, string> = {
  artanddesign: 'Art and design',
  commentisfree: 'Opinion',
  lifeandstyle: 'Life and style',
  'tv-and-radio': 'TV and radio',
  'uk-news': 'UK news',
  'us-news': 'US news',
  world: 'World news',
}

// names the Semrush search terms lowercase in a way title case can't fix
const NAME_FIXES: Record<string, string> = {
  'lebron james': 'LeBron James',
  'timothee chalamet': 'Timothée Chalamet',
  'jk rowling': 'JK Rowling',
  beyonce: 'Beyoncé',
  'paul mccartney': 'Paul McCartney',
  'leonardo dicaprio': 'Leonardo DiCaprio',
}

export const sectionTitle = (id: string) =>
  SECTION_TITLES[id] ?? id.replace(/-/g, ' ').replace(/^\p{L}/u, (c) => c.toUpperCase())

export const displayName = (term: string) =>
  NAME_FIXES[term] ?? term.replace(/(^|[\s-])\p{L}/gu, (m) => m.toUpperCase())

export function parseCsv(csv: string): ScoreRow[] {
  const [header, ...lines] = csv.trim().split(/\r?\n/)
  const cols = header!.split(',').map((c) => c.trim())
  return lines.map((line) => Object.fromEntries(line.split(',').map((v, i) => [cols[i], v.trim()])) as unknown as ScoreRow)
}

export function chartRows(rows: ScoreRow[]) {
  return rows
    .filter((row) => row.other_sections !== '')
    .map((row) => ({
      name: displayName(row.person),
      crossovers: Number(row.other_sections),
      home: sectionTitle(row.home_section),
      articles: Number(row.articles_12m),
      outsideShare: Number(row.outside_pct) / 100,
    }))
    .sort((a, b) => b.crossovers - a.crossovers || b.outsideShare - a.outsideShare || a.name.localeCompare(b.name))
    .map((person, index) => ({ rank: index + 1, ...person }))
}
