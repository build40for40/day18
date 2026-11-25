import { z } from 'zod'

// The file `npm run score` writes to src/data/crossover.json. Only rank, name and crossovers
// are required; the page hides anything else that's missing.
export const chartSchema = z.object({
  title: z.string().default('The Crossover 100'),
  window: z.object({ from: z.string(), to: z.string() }).optional(),
  generatedAt: z.string().optional(),
  /** a one-line caveat shown under the header, e.g. how many people are scored so far */
  note: z.string().optional(),
  method: z.array(z.string()).default([]),
  people: z
    .array(
      z.object({
        rank: z.number().int().positive(),
        name: z.string().min(1),
        crossovers: z.number().int().nonnegative(),
        home: z.string().optional(),
        articles: z.number().int().nonnegative().optional(),
        outsideShare: z.number().min(0).max(1).optional(),
        sections: z
          .array(z.object({ id: z.string(), title: z.string(), articles: z.number().int().nonnegative() }))
          .optional(),
      }),
    )
    .min(1),
})

export type Chart = z.infer<typeof chartSchema>
export type Person = Chart['people'][number]
