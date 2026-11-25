import { describe, expect, it } from 'vitest'

import { FALLBACK_LANE, laneOf, personLanes } from './lanes'
import { parseSearches, parseVolume, searchesFor } from './searches'

describe('laneOf', () => {
  it('maps section ids and home titles to the same lane', () => {
    expect(laneOf('world')).toBe('world')
    expect(laneOf('World news')).toBe('world')
    expect(laneOf('us-news')).toBe('politics')
    expect(laneOf('US news')).toBe('politics')
    expect(laneOf('Television & radio')).toBe('tv')
    expect(laneOf('Life and style')).toBe('lifestyle')
    expect(laneOf('football')).toBe('sport')
  })

  it('puts unknown sections in the fallback lane', () => {
    expect(laneOf('some-new-section')).toBe(FALLBACK_LANE)
  })
})

describe('personLanes', () => {
  it('keeps the home lane out of the crossed lanes', () => {
    const lanes = personLanes({
      rank: 1,
      name: 'Ada Fake',
      crossovers: 3,
      home: 'US news',
      sections: [
        { id: 'politics', title: 'Politics', articles: 4 },
        { id: 'sport', title: 'Sport', articles: 2 },
        { id: 'football', title: 'Football', articles: 1 },
      ],
    })
    expect(lanes.home).toBe('politics')
    expect([...lanes.crossed]).toEqual(['sport'])
  })
})

describe('searches', () => {
  it('parses banded volumes', () => {
    expect(parseVolume('7.5M')).toBe(7_500_000)
    expect(parseVolume('823K')).toBe(823_000)
    expect(parseVolume('90.5K')).toBe(90_500)
    expect(parseVolume('n/a')).toBeUndefined()
  })

  it('matches names ignoring case and accents', () => {
    const map = parseSearches('rank,search_term,monthly_searches\n1,timothee chalamet,1M')
    expect(map.get('timothee chalamet')).toBe(1_000_000)
    expect(searchesFor('Taylor Swift')).toBe(4_100_000)
    expect(searchesFor('Timothée Chalamet')).toBe(1_000_000)
  })
})
