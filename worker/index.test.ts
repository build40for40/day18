// @vitest-environment node
import { describe, expect, it } from 'vitest'

import worker from './index'

const call = (path: string) => worker.fetch(new Request(`https://build40for40.com${path}`))

describe('worker', () => {
  it('redirects the old /day18 address to /crossover, keeping the path and query', async () => {
    for (const [from, to] of [
      ['/day18', '/crossover'],
      ['/day18/', '/crossover/'],
      ['/day18/assets/app.js?v=1', '/crossover/assets/app.js?v=1'],
    ]) {
      const res = await call(from!)
      expect(res.status).toBe(301)
      expect(res.headers.get('location')).toBe(`https://build40for40.com${to}`)
    }
  })

  it('answers 404 for the API routes until there is an API', async () => {
    expect((await call('/crossover/api/anything')).status).toBe(404)
  })
})
