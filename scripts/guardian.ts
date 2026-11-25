// Shared Guardian Content API helper: key check, 1 call a second, a local cache and a daily budget.
// Cached responses live in data/cache/ (gitignored), so rerunning a script costs no calls.
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// GUARDIAN_BASE and GUARDIAN_GAP_MS exist only for testing against a mock server
const BASE = process.env.GUARDIAN_BASE ?? 'https://content.guardianapis.com'
const CACHE_DIR = 'data/cache'
const GAP_MS = Number(process.env.GUARDIAN_GAP_MS ?? 1100)

export class BudgetSpent extends Error {}

export function apiKey(): string {
  const key = process.env.GUARDIAN_API_KEY
  if (!key) {
    console.error('No GUARDIAN_API_KEY. Copy .env.example to .env and add your Guardian developer key.')
    process.exit(1)
  }
  return key
}

export function createClient(key: string, budget: number) {
  let calls = 0
  let last = 0

  async function get<T>(path: string, params: Record<string, string | number>): Promise<T> {
    const query = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))
    const id = `${path}?${query}`
    const file = join(CACHE_DIR, `${createHash('sha1').update(id).digest('hex')}.json`)

    try {
      return JSON.parse(await readFile(file, 'utf8')) as T
    } catch {
      // not cached yet
    }

    if (calls >= budget) throw new BudgetSpent(`Stopped at the budget of ${budget} calls.`)
    const wait = last + GAP_MS - Date.now()
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
    last = Date.now()
    calls++

    query.set('api-key', key)
    const response = await fetch(`${BASE}${path}?${query}`)
    if (!response.ok) {
      // never print the URL: it holds the key
      throw new Error(`Guardian API answered ${response.status} for ${path}`)
    }
    const body = (await response.json()) as { response: T }
    await mkdir(CACHE_DIR, { recursive: true })
    await writeFile(file, JSON.stringify(body.response))
    return body.response
  }

  return { get, calls: () => calls }
}
