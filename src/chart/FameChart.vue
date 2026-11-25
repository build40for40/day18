<script setup lang="ts">
import { computed, ref } from 'vue'

import { LANES, laneName, personLanes } from './lanes'
import type { Person } from './schema'
import { fold, searchesFor } from './searches'

const props = defineProps<{ people: Person[] }>()
const emit = defineEmits<{ open: [rank: number] }>()

const W = 400
const H = 354
const L = 34
const R = 390
const T = 26
const B = 302

const points = computed(() =>
  props.people
    .map((person) => ({ person, searches: searchesFor(person.name), home: personLanes(person).home }))
    .filter((p): p is { person: Person; searches: number; home: string | undefined } => p.searches !== undefined),
)

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)] ?? 0
}

const scale = computed(() => {
  const vols = points.value.length ? points.value.map((p) => p.searches) : [1]
  const lo = Math.log10(Math.min(...vols) * 0.8)
  const hi = Math.log10(Math.max(...vols) * 1.25)
  const yMax = Math.max(5, Math.ceil(Math.max(0, ...points.value.map((p) => p.person.crossovers)) / 5) * 5)
  const x = (v: number) => L + ((Math.log10(v) - lo) / (hi - lo)) * (R - L)
  // square-root scale, so one runaway score doesn't flatten everyone else onto the floor
  const y = (c: number) => B - Math.sqrt(c / yMax) * (B - T)
  const midX = median(vols)
  const midY = median(points.value.map((p) => p.person.crossovers))
  const xTicks = [
    [100_000, '100K'],
    [250_000, '250K'],
    [500_000, '500K'],
    [1_000_000, '1M'],
    [2_500_000, '2.5M'],
    [5_000_000, '5M'],
  ].filter(([v]) => Math.log10(v as number) > lo && Math.log10(v as number) < hi) as [number, string][]
  const yTicks = [1, 2, 5, 10, 20, 30, 40].filter((c) => c <= yMax)
  return { x, y, midX, midY, xTicks, yTicks }
})

const query = ref('')
const lane = ref('all')
const active = ref<string | null>(null)
const filtering = computed(() => fold(query.value) !== '' || lane.value !== 'all')
const matches = (p: { person: Person; home?: string }) =>
  (!fold(query.value) || fold(p.person.name).includes(fold(query.value))) &&
  (lane.value === 'all' || p.home === lane.value)

// deterministic jitter so people with the same score and search band don't sit on top of each other
const jitter = (name: string, salt: number) => {
  let h = salt
  for (const c of name) h = (Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0) % 1_000_003
  return ((h % 9) - 4) / 4
}

const dots = computed(() => {
  const { x, y, midX, midY } = scale.value
  const all = points.value.map((p) => {
    const cx = x(p.searches) + jitter(p.person.name, 7) * 3
    const cy = y(p.person.crossovers) + jitter(p.person.name, 13) * 3
    const hit = matches(p)
    const aboveFame = p.searches < midX && p.person.crossovers > midY
    return { ...p, cx, cy, hit, aboveFame }
  })
  // label the top scorers plus the best of each interesting corner, unless a filter is on
  const pickNames = new Set<string>()
  if (filtering.value) {
    const hits = all.filter((d) => d.hit)
    if (hits.length <= 12) hits.forEach((d) => pickNames.add(d.person.name))
  } else {
    ;[...all].sort((a, b) => b.person.crossovers - a.person.crossovers).slice(0, 6).forEach((d) => pickNames.add(d.person.name))
    all.filter((d) => d.aboveFame).sort((a, b) => b.person.crossovers - a.person.crossovers).slice(0, 4).forEach((d) => pickNames.add(d.person.name))
    all.filter((d) => d.searches > midX && d.person.crossovers <= midY).sort((a, b) => b.searches - a.searches).slice(0, 3).forEach((d) => pickNames.add(d.person.name))
  }
  const placed: { x: number; y: number }[] = []
  return all.map((d) => {
    let label = pickNames.has(d.person.name)
    const right = d.cx < 300
    const lx = right ? d.cx + 6 : d.cx - 6
    const ly = d.cy + 3.5
    if (label && placed.some((p) => Math.abs(p.y - ly) < 10 && Math.abs(p.x - lx) < 70)) label = false
    if (label) placed.push({ x: lx, y: ly })
    return { ...d, label, lx, ly, anchor: right ? 'start' : 'end' }
  })
})

const activeDot = computed(() => dots.value.find((d) => d.person.name === active.value))
const homeLanes = computed(() => LANES.filter((l) => points.value.some((p) => p.home === l.id)))
const fmt = (v: number) => (v >= 1_000_000 ? `${+(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}K`)
const tipLeft = computed(() => (activeDot.value ? Math.min(82, Math.max(18, (activeDot.value.cx / W) * 100)) : 0))
const tipTop = computed(() => (activeDot.value ? (activeDot.value.cy / H) * 100 : 0))
const tipBelow = computed(() => tipTop.value < 30)
</script>

<template>
  <div v-if="points.length >= 3" class="fame">
    <figure class="plate wide">
      <div class="poster paper">
        <div class="brand"><span>The Crossover 100 Index</span><span>The thesis</span></div>
        <h2>Fame isn't<br /><em>influence.</em></h2>
        <p class="dek">
          Across: how often the world Googles them. Up: how many sections of the Guardian they crossed into. The most
          searched name isn't the one who moves the most worlds.
        </p>
        <div class="chart" @mouseleave="active = null">
          <svg :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Scatter of monthly Google searches against sections crossed">
            <rect :x="L" :y="T" :width="scale.x(scale.midX) - L" :height="scale.y(scale.midY) - T" fill="#2236FF" fill-opacity="0.07" />
            <line :x1="scale.x(scale.midX)" :x2="scale.x(scale.midX)" :y1="T" :y2="B" stroke="#0B0B2B" stroke-opacity="0.25" />
            <line :x1="L" :x2="R" :y1="scale.y(scale.midY)" :y2="scale.y(scale.midY)" stroke="#0B0B2B" stroke-opacity="0.25" />
            <line :x1="L" :x2="R" :y1="B" :y2="B" stroke="#0B0B2B" />
            <g font-family="DM Mono, monospace" font-size="9" fill="#0B0B2B">
              <text v-for="[v, t] in scale.xTicks" :key="t" :x="scale.x(v)" :y="B + 14" text-anchor="middle" fill-opacity="0.7">{{ t }}</text>
              <text v-for="c in scale.yTicks" :key="c" :x="L - 6" :y="scale.y(c) + 3" text-anchor="end" fill-opacity="0.7">{{ c }}</text>
              <text :x="R" :y="B + 30" text-anchor="end">GOOGLE SEARCHES A MONTH →</text>
              <text :transform="`translate(${L - 24} ${T}) rotate(-90)`" text-anchor="end">SECTIONS CROSSED →</text>
            </g>
            <g font-family="Bricolage Grotesque, sans-serif" font-size="10.5" font-weight="700" letter-spacing="0.4">
              <text :x="L + 4" :y="T - 8" fill="#2236FF">↖ PUNCHING ABOVE FAME</text>
              <text :x="R" :y="T - 8" text-anchor="end" fill="#0B0B2B">SUPERPOWERS ↗</text>
              <text :x="R" :y="B + 44" text-anchor="end" fill="#0B0B2B" fill-opacity="0.6">↘ FAMOUS IN ONE LANE</text>
              <text :x="L + 4" :y="B + 44" fill="#0B0B2B" fill-opacity="0.6">↙ SPECIALISTS</text>
            </g>
            <circle
              v-for="d in dots"
              :key="d.person.rank"
              :cx="d.cx"
              :cy="d.cy"
              :r="d.label || d.person.name === active ? 4.2 : 3"
              :fill="d.aboveFame ? '#2236FF' : '#0B0B2B'"
              :fill-opacity="filtering ? (d.hit ? 1 : 0.08) : d.label ? 1 : 0.4"
            />
            <text
              v-for="d in dots.filter((x) => x.label)"
              :key="`l${d.person.rank}`"
              :x="d.lx"
              :y="d.ly"
              :text-anchor="d.anchor"
              font-size="10"
              font-weight="600"
              font-family="Instrument Sans, sans-serif"
              fill="#0B0B2B"
              paint-order="stroke"
              stroke="#FBFAFF"
              stroke-width="3"
            >
              {{ d.person.name }}
            </text>
            <circle
              v-for="d in dots"
              :key="`h${d.person.rank}`"
              class="hit"
              :cx="d.cx"
              :cy="d.cy"
              r="8"
              fill="#000000"
              fill-opacity="0"
              @mouseenter="active = d.person.name"
              @click="emit('open', d.person.rank)"
            />
          </svg>
          <div
            v-if="activeDot"
            class="tip"
            :class="{ below: tipBelow }"
            :style="{ left: `${tipLeft}%`, top: `${tipTop}%` }"
            role="status"
          >
            <b>{{ activeDot.person.name }}</b>
            <span>#{{ activeDot.person.rank }} · known for {{ activeDot.person.home ?? 'unknown' }}</span>
            <span>{{ fmt(activeDot.searches) }} searches a month</span>
            <span>{{ activeDot.person.crossovers }} sections crossed</span>
            <span class="cta">Click to open their card</span>
          </div>
        </div>
        <div class="foot">
          <span>Searches: Semrush, Mar 2026. {{ points.length }} of {{ people.length }} people have search data.</span>
          <span>build40for40.com/crossover</span>
        </div>
      </div>
    </figure>
    <div class="explore">
      <label for="fame-q" class="eyebrow">Find someone on the chart</label>
      <input id="fame-q" v-model="query" type="search" placeholder="Try Kelce, Swift, Musk" autocomplete="off" />
      <span class="eyebrow">Known for</span>
      <div class="chips" role="group" aria-label="Filter the chart by what they're known for">
        <button type="button" :aria-pressed="lane === 'all'" @click="lane = 'all'">All</button>
        <button v-for="l in homeLanes" :key="l.id" type="button" :aria-pressed="lane === l.id" @click="lane = l.id">
          {{ laneName(l.id) }}
        </button>
      </div>
      <p class="hint">Hover a dot for a quick look, or tap it to open their card. The shaded corner is who brands should be watching: more worlds than their fame suggests.</p>
    </div>
  </div>
</template>

<style scoped>
.fame {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}
.plate.wide {
  max-width: 640px;
}
.paper {
  background: var(--paper);
  color: var(--navy);
  padding: 6cqw;
  gap: 1.8cqw;
}
h2 {
  margin: 0;
  font-size: 11cqw;
  line-height: 0.86;
  font-weight: 800;
  font-variation-settings: 'wdth' 76;
  letter-spacing: -0.02em;
}
h2 em {
  font-style: normal;
  color: var(--cobalt);
}
.dek {
  margin: 0 0 1cqw;
  font-size: 2.8cqw;
  line-height: 1.35;
  max-width: 46ch;
}
.chart {
  position: relative;
}
svg {
  display: block;
  width: 100%;
  height: auto;
}
.hit {
  cursor: pointer;
}
.tip {
  position: absolute;
  transform: translate(-50%, calc(-100% - 10px));
  width: max-content;
  max-width: 220px;
  background: var(--navy);
  color: #fff;
  border-radius: 8px;
  padding: 8px 11px;
  display: grid;
  gap: 1px;
  font-size: 12px;
  line-height: 1.4;
  pointer-events: none;
  box-shadow: 0 10px 30px -10px rgba(11, 11, 43, 0.6);
}
.tip.below {
  transform: translate(-50%, 14px);
}
.tip b {
  font-family: var(--display);
  font-size: 15px;
}
.tip span {
  opacity: 0.8;
}
.tip .cta {
  opacity: 1;
  color: var(--pink);
  margin-top: 3px;
}
@media (hover: none) {
  .tip .cta {
    display: none;
  }
}
.explore {
  display: grid;
  gap: 10px;
  align-content: start;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--card);
}
.explore input {
  width: 100%;
  border: 1px solid var(--line);
  background: var(--bg);
  border-radius: 999px;
  padding: 9px 14px;
}
.hint {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--muted);
}
@media (max-width: 860px) {
  .fame {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
