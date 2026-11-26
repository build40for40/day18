import type { Person } from '../chart/schema'

// Hot or Not, crossover edition. "Hot" means crossing into more Guardian sections than the
// middle of the 100, so roughly half the Index is hot and half is stuck in its lane.

export type Verdict = 'hot' | 'not'

export const ROUND_SIZE = 10

export function hotLine(people: Person[]): number {
  const sorted = people.map((p) => p.crossovers).sort((a, b) => a - b)
  const median = sorted[Math.floor((sorted.length - 1) / 2)] ?? 0
  return median + 1
}

export const verdictOf = (person: Person, line: number): Verdict => (person.crossovers >= line ? 'hot' : 'not')

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

// Half hot, half not, in a random order, so always guessing one way can't win.
export function dealRound(people: Person[], line: number, size = ROUND_SIZE, random = Math.random): Person[] {
  const hot = shuffle(people.filter((p) => verdictOf(p, line) === 'hot'), random)
  const not = shuffle(people.filter((p) => verdictOf(p, line) === 'not'), random)
  const half = Math.floor(size / 2)
  const hotCount = Math.min(hot.length, size - Math.min(not.length, half))
  return shuffle([...hot.slice(0, hotCount), ...not.slice(0, size - hotCount)], random)
}

export function scoreLine(score: number, total: number): string {
  const share = total ? score / total : 0
  if (share === 1) return 'Perfect. You read the whole paper, every section, every day.'
  if (share >= 0.8) return "You've got a newsroom brain. The Guardian should hire you."
  if (share >= 0.6) return 'Solid. You can smell a crossover coming.'
  if (share >= 0.4) return 'Coin toss energy. Fame fooled you a few times.'
  return 'The algorithm got you. Famous and influential are not the same thing.'
}

export const shareText = (results: boolean[], score: number, url: string) =>
  `Crossover Hot or Not: ${score}/${results.length}\n${results.map((r) => (r ? '✅' : '❌')).join('')}\n${url}`
