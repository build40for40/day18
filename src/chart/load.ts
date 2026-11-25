import sample from '../data/crossover.sample.json'
import { chartSchema, type Chart } from './schema'

// The real chart only exists once Samira runs `npm run score`, so it's an optional import.
const real = import.meta.glob<unknown>('../data/crossover.json', { eager: true, import: 'default' })

export interface LoadedChart {
  chart: Chart
  isSample: boolean
}

export function loadChart(files: Record<string, unknown> = real): LoadedChart {
  const file = Object.values(files)[0]
  if (file !== undefined) return { chart: chartSchema.parse(file), isSample: false }
  return { chart: chartSchema.parse(sample), isSample: true }
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London' })

export const formatDay = (iso: string) => dateFormat.format(new Date(`${iso}T12:00:00Z`))
