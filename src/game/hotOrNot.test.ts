// @vitest-environment node
import { describe, expect, it } from 'vitest'

import type { Person } from '../chart/schema'
import { dealRound, hotLine, scoreLine, shareText, verdictOf } from './hotOrNot'

const people: Person[] = [1, 1, 2, 2, 3, 3, 3, 5, 8, 12, 20, 28].map((crossovers, i) => ({
  rank: i + 1,
  name: `Fake ${i + 1}`,
  crossovers,
}))

// a fixed sequence, so deals are repeatable
const seeded = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

describe('hotLine', () => {
  it('sits just above the median', () => {
    expect(hotLine(people)).toBe(4)
  })

  it('splits the real-ish data into hot and not', () => {
    const line = hotLine(people)
    expect(verdictOf(people[6]!, line)).toBe('not')
    expect(verdictOf(people[7]!, line)).toBe('hot')
  })
})

describe('dealRound', () => {
  it('deals half hot, half not, with no repeats', () => {
    const line = hotLine(people)
    const round = dealRound(people, line, 10, seeded())
    expect(round).toHaveLength(10)
    expect(new Set(round.map((p) => p.name)).size).toBe(10)
    expect(round.filter((p) => verdictOf(p, line) === 'hot')).toHaveLength(5)
  })

  it('tops up from the other pile when one runs short', () => {
    const line = hotLine(people)
    const round = dealRound(people, line, 12, seeded())
    expect(round).toHaveLength(12)
  })
})

describe('copy', () => {
  it('builds a share grid', () => {
    expect(shareText([true, false, true], 2, 'https://example.test')).toBe(
      'Crossover Hot or Not: 2/3\n✅❌✅\nhttps://example.test',
    )
  })

  it('has a line for every score', () => {
    for (let s = 0; s <= 10; s++) expect(scoreLine(s, 10)).not.toBe('')
  })
})
