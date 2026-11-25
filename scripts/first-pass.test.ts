// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { chartRows, displayName, parseCsv, sectionTitle } from './first-pass.ts'

const csv = [
  'semrush_rank,person,group,tag,articles_12m,home_section,other_sections,outside_pct,truncated_at_1000',
  '1,ada fake,,music/ada-fake,40,music,3,25,',
  '2,bo fake,,film/bo-fake,10,film,3,60,',
  '3,cy fake,,,,,,,',
  '4,lebron james,,sport/lebron-james,20,tv-and-radio,5,10,',
].join('\r\n')

describe('first pass chart', () => {
  it('ranks by crossovers, then outside share, and drops unscored people', () => {
    const rows = chartRows(parseCsv(csv))
    expect(rows.map((r) => `${r.rank} ${r.name} ${r.crossovers}`)).toEqual([
      '1 LeBron James 5',
      '2 Bo Fake 3',
      '3 Ada Fake 3',
    ])
    expect(rows[0]).toMatchObject({ home: 'TV and radio', articles: 20, outsideShare: 0.1 })
  })

  it('tidies names and section ids for display', () => {
    expect(displayName('beyonce')).toBe('Beyoncé')
    expect(displayName('jean-luc fake')).toBe('Jean-Luc Fake')
    expect(sectionTitle('us-news')).toBe('US news')
    expect(sectionTitle('environment')).toBe('Environment')
  })
})
