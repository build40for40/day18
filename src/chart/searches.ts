import seed from '../../research/semrush-living-seed-100.csv?raw'
import extension from '../../research/semrush-seed-extension-13.csv?raw'

// Monthly Google searches from Semrush (March 2026), for the fame chart only. Hand-picked people
// outside Semrush's list have none and are left off that chart.
export const fold = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export function parseVolume(text: string): number | undefined {
  const match = /^([\d.]+)\s*([KM]?)$/i.exec(text.trim())
  if (!match) return undefined
  const n = Number(match[1])
  const unit = match[2]?.toUpperCase()
  return Math.round(unit === 'M' ? n * 1_000_000 : unit === 'K' ? n * 1_000 : n)
}

export function parseSearches(...csvs: string[]): Map<string, number> {
  const out = new Map<string, number>()
  for (const csv of csvs) {
    const [header, ...lines] = csv.trim().split(/\r?\n/)
    const cols = (header ?? '').split(',')
    const nameAt = cols.indexOf('search_term')
    const volAt = cols.indexOf('monthly_searches')
    for (const line of lines) {
      const cells = line.split(',')
      const name = cells[nameAt]
      const volume = parseVolume(cells[volAt] ?? '')
      if (name && volume !== undefined) out.set(fold(name), volume)
    }
  }
  return out
}

const searches = parseSearches(seed, extension)

export const searchesFor = (name: string) => searches.get(fold(name))
