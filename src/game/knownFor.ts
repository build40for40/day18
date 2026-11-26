import { laneName, personLanes } from '../chart/lanes'
import type { Person } from '../chart/schema'
import { fold } from '../chart/searches'

// What people are famous for, for the game's "Known for" label only. The Index's home section is
// whichever Guardian section wrote about them most this year, which isn't always what they're known
// for (Travis Kelce's home is Music thanks to the wedding). Scores and the table keep the Guardian's.
// Checked by hand against all 100 on 26 Nov 2026; anyone not listed keeps their lane.
export const KNOWN_FOR: Record<string, string> = {
  // the paper's lane is something they happened to be in this year
  'travis kelce': 'Sport',
  'bill gates': 'Tech & science',
  'jeff bezos': 'Business',
  'stephen king': 'Books',
  'jk rowling': 'Books',
  'yoko ono': 'Art',
  stormzy: 'Music',
  'cardi b': 'Music',
  'katy perry': 'Music',
  'justin timberlake': 'Music',
  rihanna: 'Music',
  'jennifer lopez': 'Music',
  'jennifer lawrence': 'Film',
  'anya taylor-joy': 'Film',
  'gordon ramsay': 'Food',
  'joe rogan': 'Podcasts',
  'kim kardashian': 'TV & media',
  'kylie jenner': 'Beauty',
  // no lane fits
  'prince harry': 'Royal family',
  'meghan markle': 'Royal family',
  'pope leo xiv': 'Religion',
  'dalai lama': 'Religion',
  'greta thunberg': 'Climate',
  // world leaders sit in World news, but they're known for politics
  'vladimir putin': 'Politics',
  'xi jinping': 'Politics',
  'marco rubio': 'Politics',
  'benjamin netanyahu': 'Politics',
  'narendra modi': 'Politics',
  'volodymyr zelenskyy': 'Politics',
  'javier milei': 'Politics',
  'giorgia meloni': 'Politics',
}

export interface KnownFor {
  label: string
  // the Guardian's lane, when it differs from the label
  paper?: string
}

export function knownFor(person: Person): KnownFor {
  const lane = personLanes(person).home
  const paper = lane ? laneName(lane) : person.home
  const label = KNOWN_FOR[fold(person.name)] ?? paper ?? 'their lane'
  // "Books" inside "Arts & books" isn't news, so only mention the paper when it's somewhere else
  return { label, paper: paper && !paper.toLowerCase().includes(label.toLowerCase()) ? paper : undefined }
}

const compact = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 })

// How famous they look: Google searches where Semrush has them, otherwise how much the Guardian
// wrote about them. Hand-picked people aren't on Semrush's list, so they get the second.
export function fameLine(person: Person, searches: number | undefined): string {
  if (searches !== undefined) return `Googled ${compact.format(searches).toUpperCase()} times a month`
  const articles = person.articlesTotal ?? person.articles
  if (articles === undefined) return ''
  return `${compact.format(articles).toUpperCase()} Guardian ${articles === 1 ? 'article' : 'articles'} this year`
}
