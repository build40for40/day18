import type { Person } from './schema'

// The Guardian has dozens of sections, which is too many to read at a glance. The page groups them
// into 12 lanes for display only. Scores and ranks still come straight from crossover.json.
export interface Lane {
  id: string
  name: string
  sections: string[]
}

export const LANES: Lane[] = [
  { id: 'music', name: 'Music', sections: ['music'] },
  { id: 'film', name: 'Film', sections: ['film'] },
  { id: 'tv', name: 'TV & media', sections: ['tv-and-radio', 'media'] },
  { id: 'sport', name: 'Sport', sections: ['sport', 'football'] },
  { id: 'fashion', name: 'Fashion', sections: ['fashion'] },
  { id: 'lifestyle', name: 'Lifestyle', sections: ['lifeandstyle', 'food', 'travel', 'thefilter', 'thefilter-us'] },
  { id: 'arts', name: 'Arts & books', sections: ['culture', 'books', 'artanddesign', 'stage'] },
  { id: 'business', name: 'Business', sections: ['business', 'money'] },
  { id: 'tech', name: 'Tech & science', sections: ['technology', 'science', 'games'] },
  { id: 'politics', name: 'Politics', sections: ['politics', 'us-news', 'uk-news', 'australia-news', 'law'] },
  { id: 'world', name: 'World', sections: ['world', 'global', 'global-development', 'environment'] },
  { id: 'society', name: 'Society', sections: ['society', 'education', 'news', 'community', 'membership'] },
]

export const FALLBACK_LANE = 'society'

const squash = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '')

// Home is stored as a section title ("World news"), crossovers as section ids ("world").
// Squashing both makes most of them meet; these are the ones that don't.
const ALIASES: Record<string, string> = { worldnews: 'world', televisionradio: 'tvandradio' }

const bySection = new Map<string, string>()
for (const lane of LANES) for (const section of lane.sections) bySection.set(squash(section), lane.id)

export function laneOf(section: string): string {
  const key = squash(section)
  return bySection.get(ALIASES[key] ?? key) ?? FALLBACK_LANE
}

export const laneName = (id: string) => LANES.find((l) => l.id === id)?.name ?? id

export interface PersonLanes {
  home?: string
  crossed: Set<string>
}

export function personLanes(person: Person): PersonLanes {
  const home = person.home ? laneOf(person.home) : undefined
  const crossed = new Set((person.sections ?? []).map((s) => laneOf(s.id)))
  if (home) crossed.delete(home)
  return { home, crossed }
}
