// Samira's crossover scoring, kept pure so it can be tested and tweaked without re-pulling.
// Home section: the one with the most articles. Crossovers: other sections with at least
// `threshold` articles. Rank by crossovers, then outside share, then name.

export type Match = 'tag' | 'phrase' | 'none'

/** One person's 12 months of Guardian coverage, as written by `npm run pull`. */
export interface PersonCounts {
  seedRank: number
  name: string
  match: Match
  tag?: string
  articles: number
  /** articles per Guardian section id */
  sections: Record<string, number>
}

export interface ScoreRules {
  /** minimum articles in a section to count it, by how the person was matched */
  threshold: Record<Exclude<Match, 'none'>, number>
  /** section ids that never count as a crossover (network or regional sections, say) */
  ignore: string[]
  /** section ids counted as another section (football as sport, say), applied before scoring */
  merge?: Record<string, string>
  top: number
}

export interface Scored {
  rank: number
  name: string
  crossovers: number
  home: string
  articles: number
  outsideShare: number
  /** sections crossed into, beyond home, with their article counts */
  crossed: { id: string; articles: number }[]
}

export function scorePerson(person: PersonCounts, rules: ScoreRules): Omit<Scored, 'rank'> | null {
  if (person.match === 'none') return null
  const merged: Record<string, number> = {}
  for (const [id, n] of Object.entries(person.sections)) {
    if (n <= 0 || rules.ignore.includes(id)) continue
    const target = rules.merge?.[id] ?? id
    merged[target] = (merged[target] ?? 0) + n
  }
  const counts = Object.entries(merged)
  const total = counts.reduce((sum, [, n]) => sum + n, 0)
  if (total === 0) return null

  const [home, homeCount] = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]!
  const min = rules.threshold[person.match]
  const crossed = counts
    .filter(([id, n]) => id !== home && n >= min)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id, articles]) => ({ id, articles }))

  return {
    name: person.name,
    crossovers: crossed.length,
    home,
    articles: total,
    outsideShare: Math.round(((total - homeCount) / total) * 1000) / 1000,
    crossed,
  }
}

export function rankPeople(people: PersonCounts[], rules: ScoreRules): Scored[] {
  return people
    .map((person) => scorePerson(person, rules))
    .filter((scored) => scored !== null)
    .sort((a, b) => b.crossovers - a.crossovers || b.outsideShare - a.outsideShare || a.name.localeCompare(b.name))
    .slice(0, rules.top)
    .map((scored, index) => ({ rank: index + 1, ...scored }))
}
