import { laneName, personLanes } from '../chart/lanes'
import type { Person } from '../chart/schema'
import { fold } from '../chart/searches'

// What people are famous for, for the game's "Known for" label only. The Index's home section is
// whichever Guardian section wrote about them most this year, which isn't always what they're known
// for (Travis Kelce's home is Music thanks to the wedding). Scores and the table keep the Guardian's.
const KNOWN_FOR: Record<string, string> = {
  'travis kelce': 'Sport',
  'bill gates': 'Tech & science',
  'prince harry': 'Royal family',
  'meghan markle': 'Royal family',
  'stephen king': 'Books',
  stormzy: 'Music',
  'cardi b': 'Music',
  'katy perry': 'Music',
  'justin timberlake': 'Music',
  rihanna: 'Music',
  'jennifer lopez': 'Music',
  'jennifer lawrence': 'Film',
  'joe rogan': 'Podcasts',
  'kim kardashian': 'TV & media',
  'kylie jenner': 'TV & media',
  'pope leo xiv': 'Religion',
  'dalai lama': 'Religion',
  'greta thunberg': 'Climate',
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
  return { label, paper: paper && paper !== label ? paper : undefined }
}
