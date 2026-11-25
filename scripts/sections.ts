// npm run sections: saves every Guardian section to research/guardian-sections.json. Costs 1 call.
import { writeFile } from 'node:fs/promises'

import { apiKey, createClient } from './guardian.ts'

interface SectionsResponse {
  total: number
  results: { id: string; webTitle: string; webUrl: string }[]
}

const client = createClient(apiKey(), 5)
const response = await client.get<SectionsResponse>('/sections', {})
const sections = response.results
  .map(({ id, webTitle, webUrl }) => ({ id, title: webTitle, url: webUrl }))
  .sort((a, b) => a.id.localeCompare(b.id))

await writeFile(
  'research/guardian-sections.json',
  JSON.stringify({ retrieved: new Date().toISOString().slice(0, 10), total: sections.length, sections }, null, 2) + '\n',
)
console.log(`Saved ${sections.length} sections to research/guardian-sections.json (${client.calls()} call used).`)
