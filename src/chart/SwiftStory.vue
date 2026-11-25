<script setup lang="ts">
import { computed } from 'vue'

import index from '../../research/crossover-index.json'

// Real data: every Guardian section Taylor Swift has appeared in, all time, from the case study.
const study = index.case_study_taylor_swift
const entries = study.section_entries

const W = 400
const H = 290
const L = 30
const R = 388
const T = 12
const B = 262
const START = 2008
const END = 2027

const x = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return L + (((y ?? START) + ((m ?? 1) - 1) / 12 - START) / (END - START)) * (R - L)
}
const y = (n: number) => B - (n / 32) * (B - T)

const LABELS: Record<string, [string, number]> = {
  music: ['Music', 1],
  technology: ['Tech', 1],
  commentisfree: ['Opinion', 1],
  business: ['Business', 1],
  politics: ['Politics', 1],
  sport: ['Sport, the Kelce era', -1],
}

const chart = computed(() => {
  let path = `M${x(entries[0]!.first_month)},${B}`
  entries.forEach((e, i) => {
    path += ` H${x(e.first_month).toFixed(1)} V${y(i + 1).toFixed(1)}`
  })
  path += ` H${x(study.last_article_month).toFixed(1)}`
  const dots = entries.map((e, i) => {
    const r = Math.min(14, 2.2 + Math.sqrt(e.articles) * 0.55)
    const label = LABELS[e.section]
    return { key: e.section, cx: x(e.first_month), cy: y(i + 1), r, music: e.section === 'music', label }
  })
  return { path, area: `${path} V${B} Z`, dots }
})
const years = [2008, 2012, 2016, 2020, 2024]
</script>

<template>
  <div class="swift">
    <figure class="plate">
      <div class="poster pink">
        <div class="brand"><span>The Crossover 100 Index</span><span>Case study</span></div>
        <h2>18 years.<br />{{ study.sections_entered }} sections.</h2>
        <p class="dek">
          How Taylor Swift walked out of the music pages and into the rest of the paper. Each dot is the first month she
          showed up somewhere new, sized by how much she was written about there.
        </p>
        <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="`Step chart of the ${study.sections_entered} Guardian sections Taylor Swift entered from 2008 to 2026`">
          <g v-for="yr in years" :key="yr">
            <line :x1="x(`${yr}-01`)" :x2="x(`${yr}-01`)" :y1="T" :y2="B" stroke="#0B0B2B" stroke-opacity="0.12" stroke-dasharray="2 3" />
            <text :x="x(`${yr}-01`)" :y="B + 16" font-size="10" font-family="DM Mono, monospace" fill="#0B0B2B" text-anchor="middle">{{ yr }}</text>
          </g>
          <text v-for="n in [0, 10, 20, 30]" :key="n" :x="L - 6" :y="y(n) + 3" font-size="9" font-family="DM Mono, monospace" fill="#0B0B2B" fill-opacity="0.6" text-anchor="end">{{ n }}</text>
          <path :d="chart.area" fill="#2236FF" fill-opacity="0.1" />
          <path :d="chart.path" fill="none" stroke="#2236FF" stroke-width="2.2" stroke-linejoin="round" />
          <g v-for="d in chart.dots" :key="d.key">
            <circle :cx="d.cx" :cy="d.cy" :r="d.r" fill="#2236FF" :fill-opacity="d.music ? 0.9 : 0.55" stroke="#FFC2DA" stroke-width="1" />
            <text
              v-if="d.label"
              :x="d.cx + d.label[1] * (d.r + 5)"
              :y="d.cy + 4"
              font-size="11"
              font-weight="600"
              font-family="Instrument Sans, sans-serif"
              fill="#0B0B2B"
              :text-anchor="d.label[1] > 0 ? 'start' : 'end'"
            >
              {{ d.label[0] }}
            </text>
          </g>
          <text :x="R" :y="y(study.sections_entered) - 10" font-size="11" font-family="DM Mono, monospace" fill="#2236FF" text-anchor="end">
            {{ study.sections_entered }} sections
          </text>
        </svg>
        <div class="foot">
          <span>Guardian articles tagged music/taylor-swift, Sep 2008 to Nov 2026 · {{ study.articles.toLocaleString('en-GB') }} articles</span>
          <span>build40for40.com/crossover</span>
        </div>
      </div>
    </figure>
    <div class="why">
      <h3>What a crossover career looks like</h3>
      <p>
        Swift spent three years in the music pages. Then tech, film, culture and opinion in quick succession. Business
        and politics by 2016. After 2017, nothing new for six years, until she started turning up at Chiefs games and
        the sport desk had to start writing about her.
      </p>
      <p>
        This is the shape we're ranking: not how loud someone is, but how many different rooms they get talked about in.
        Unlike the ranking above, which covers the last 12 months, this chart covers all time.
      </p>
    </div>
  </div>
</template>

<style scoped>
.swift {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 28px;
  align-items: center;
}
.pink {
  aspect-ratio: 4 / 5;
  background: var(--pink);
  color: var(--navy);
  padding: 6cqw;
  gap: 2cqw;
}
h2 {
  margin: 0;
  font-size: 11cqw;
  line-height: 0.86;
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  letter-spacing: -0.025em;
  color: var(--cobalt);
}
.dek {
  margin: 0;
  font-size: 2.9cqw;
  line-height: 1.3;
  max-width: 40ch;
  font-weight: 500;
}
svg {
  width: 100%;
  flex: 1;
  min-height: 0;
}
.why {
  display: grid;
  gap: 10px;
  max-width: 36rem;
}
.why h3 {
  margin: 0;
  font-size: 24px;
}
.why p {
  margin: 0;
  color: var(--ink-2);
}
@media (max-width: 860px) {
  .swift {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
