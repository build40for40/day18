// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { rankPeople, scorePerson, type PersonCounts, type ScoreRules } from './scoring.ts'

const rules: ScoreRules = { threshold: { tag: 3, phrase: 5 }, ignore: [], top: 100 }

const person = (name: string, sections: Record<string, number>, match: PersonCounts['match'] = 'tag'): PersonCounts => ({
  seedRank: 1,
  name,
  match,
  articles: Object.values(sections).reduce((a, b) => a + b, 0),
  sections,
})

describe('scorePerson', () => {
  it('takes the biggest section as home and counts other sections at the threshold', () => {
    const scored = scorePerson(person('Pat Fake', { music: 40, fashion: 3, sport: 2, film: 9 }), rules)
    expect(scored).toMatchObject({ home: 'music', crossovers: 2, articles: 54 })
    expect(scored?.crossed).toEqual([{ id: 'film', articles: 9 }, { id: 'fashion', articles: 3 }])
    expect(scored?.outsideShare).toBe(0.259)
  })

  it('needs more articles per section for a phrase match', () => {
    const sections = { music: 40, fashion: 4, film: 5 }
    expect(scorePerson(person('Tag Fake', sections, 'tag'), rules)?.crossovers).toBe(2)
    expect(scorePerson(person('Phrase Fake', sections, 'phrase'), rules)?.crossovers).toBe(1)
  })

  it('skips ignored sections, even as home', () => {
    const scored = scorePerson(person('Opinion Fake', { commentisfree: 50, music: 10, film: 4 }), { ...rules, ignore: ['commentisfree'] })
    expect(scored).toMatchObject({ home: 'music', crossovers: 1, articles: 14 })
  })

  it('counts a merged section as the one it points to', () => {
    const merged = { ...rules, merge: { football: 'sport' } }
    const scored = scorePerson(person('Kick Fake', { football: 30, sport: 5, music: 2 }), merged)
    expect(scored).toMatchObject({ home: 'sport', crossovers: 0, articles: 37 })
    expect(scorePerson(person('Kick Fake', { football: 30, sport: 5, music: 2 }), rules)).toMatchObject({ home: 'football', crossovers: 1 })
  })

  it('carries the full article total, and says how many were read when the pull was capped', () => {
    const full = scorePerson({ ...person('Full Fake', { music: 40, film: 2 }), total: 42 }, rules)
    expect(full).toMatchObject({ articles: 42, articlesTotal: 42 })
    expect(full).not.toHaveProperty('sampled')
    const capped = scorePerson({ ...person('Capped Fake', { music: 40, film: 2 }), total: 500 }, rules)
    expect(capped).toMatchObject({ articlesTotal: 500, sampled: 42 })
    expect(scorePerson(person('Old Fake', { music: 40, film: 2 }), rules)).not.toHaveProperty('articlesTotal')
  })

  it('drops people with no match or no articles', () => {
    expect(scorePerson(person('Nobody Fake', {}, 'none'), rules)).toBeNull()
    expect(scorePerson(person('Quiet Fake', {}), rules)).toBeNull()
  })
})

describe('rankPeople', () => {
  it('ranks by crossovers, then outside share, then name, and cuts to the top', () => {
    const ranked = rankPeople(
      [
        person('Zed Fake', { music: 10, film: 10, sport: 3 }),
        person('Amy Fake', { music: 10, film: 10, sport: 3 }),
        person('Big Fake', { music: 100, film: 3, sport: 3, fashion: 3 }),
        person('Wide Fake', { music: 10, film: 10, sport: 10 }),
        person('Solo Fake', { music: 100 }),
      ],
      { ...rules, top: 4 },
    )
    expect(ranked.map((p) => `${p.rank} ${p.name}`)).toEqual(['1 Big Fake', '2 Wide Fake', '3 Amy Fake', '4 Zed Fake'])
  })
})
