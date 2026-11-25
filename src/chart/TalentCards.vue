<script setup lang="ts">
import { computed, ref } from 'vue'

import { LANES, personLanes } from './lanes'
import type { Person } from './schema'

const props = defineProps<{ people: Person[]; edition: string }>()

const top = computed(() => props.people.slice(0, 10))
const index = ref(0)
const person = computed(() => top.value[index.value] ?? top.value[0]!)
const lanes = computed(() => personLanes(person.value))
const step = (d: number) => (index.value = (index.value + d + top.value.length) % top.value.length)

// 12 ring segments, one per lane, starting at 12 o'clock
const segments = computed(() => {
  const cx = 100
  const cy = 100
  const r0 = 46
  const r1 = 88
  const gap = 0.045
  const n = LANES.length
  const at = (a: number, r: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)] as const
  return LANES.map((lane, i) => {
    const a0 = (i / n) * 2 * Math.PI + gap
    const a1 = ((i + 1) / n) * 2 * Math.PI - gap
    const [x0, y0] = at(a0, r1)
    const [x1, y1] = at(a1, r1)
    const [x2, y2] = at(a1, r0)
    const [x3, y3] = at(a0, r0)
    const [lx, ly] = at((a0 + a1) / 2, r1 + 9)
    const home = lane.id === lanes.value.home
    const on = lanes.value.crossed.has(lane.id)
    return {
      lane,
      d: `M${x0},${y0} A${r1},${r1} 0 0 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 0 0 ${x3},${y3} Z`,
      fill: home ? '#FFC2DA' : on ? '#2236FF' : '#FFFFFF',
      opacity: home || on ? 1 : 0.08,
      lx,
      ly,
      label: lane.name.split(' ')[0],
      lit: home || on,
    }
  })
})

const percent = (share: number) => `${Math.round(share * 100)}`
const biggest = computed(() =>
  [...(person.value.sections ?? [])].sort((a, b) => b.articles - a.articles).slice(0, 3),
)
</script>

<template>
  <div class="cards">
    <figure class="plate" aria-live="polite">
      <div class="poster card">
        <div class="brand"><span>The Crossover 100 Index</span><span>{{ edition }}</span></div>
        <div class="row">
          <div class="rk"><sup>#</sup>{{ person.rank }}</div>
          <span class="slide">{{ index + 2 }} / {{ top.length + 1 }}</span>
        </div>
        <div>
          <h3>{{ person.name }}</h3>
          <div v-if="person.home" class="tag">Known for {{ person.home }}</div>
        </div>
        <div class="dialwrap">
          <svg
            viewBox="-12 -12 224 224"
            role="img"
            :aria-label="`${person.name}: known for ${person.home ?? 'unknown'}, crossed into ${lanes.crossed.size} other lanes`"
          >
            <g v-for="s in segments" :key="s.lane.id">
              <path :d="s.d" :fill="s.fill" :fill-opacity="s.opacity" />
              <text
                :x="s.lx"
                :y="s.ly + 3"
                text-anchor="middle"
                font-size="8"
                font-family="DM Mono, monospace"
                fill="#FFFFFF"
                :fill-opacity="s.lit ? 0.95 : 0.35"
              >
                {{ s.label }}
              </text>
            </g>
            <text x="100" y="106" text-anchor="middle" font-size="30" font-weight="800" font-family="Bricolage Grotesque, sans-serif" fill="#FFFFFF">
              {{ person.crossovers }}
            </text>
            <text x="100" y="121" text-anchor="middle" font-size="7.5" font-family="DM Mono, monospace" fill="#FFFFFF" fill-opacity="0.65">
              SECTIONS CROSSED
            </text>
          </svg>
          <div class="kv">
            <div v-if="person.outsideShare !== undefined">
              <span class="v">{{ percent(person.outsideShare) }}<small>%</small></span>
              <span class="k">Coverage outside {{ person.home ?? 'home' }}</span>
            </div>
            <div v-if="person.articles !== undefined">
              <span class="v">{{ person.articles.toLocaleString('en-GB') }}</span>
              <span class="k">Guardian articles, 12 months</span>
            </div>
            <div v-if="biggest.length">
              <span class="v small">{{ biggest.map((s) => s.title).join(', ') }}</span>
              <span class="k">Biggest crossovers</span>
            </div>
          </div>
        </div>
        <div class="foot"><span>Pink: known for. Blue: crossed into.</span><span>build40for40.com/crossover</span></div>
      </div>
    </figure>
    <div class="nav">
      <button type="button" class="arrow" aria-label="Previous card" @click="step(-1)">←</button>
      <div class="chips" role="group" aria-label="Pick a top 10 card">
        <button
          v-for="(p, i) in top"
          :key="p.rank"
          type="button"
          :aria-pressed="i === index"
          :title="p.name"
          @click="index = i"
        >
          {{ p.rank }}
        </button>
      </div>
      <button type="button" class="arrow" aria-label="Next card" @click="step(1)">→</button>
    </div>
  </div>
</template>

<style scoped>
.cards {
  display: grid;
  gap: 14px;
  justify-items: center;
}
.card {
  aspect-ratio: 4 / 5;
  background: var(--navy);
  color: #fff;
  padding: 6cqw;
  gap: 2.6cqw;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 3cqw;
}
.rk {
  font-family: var(--display);
  font-size: 24cqw;
  line-height: 0.78;
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  color: var(--cobalt);
  -webkit-text-stroke: 0.3cqw var(--cobalt-2);
  letter-spacing: -0.03em;
}
.rk sup {
  font-size: 6cqw;
  vertical-align: top;
  -webkit-text-stroke: 0;
  color: var(--pink);
}
.slide {
  font-family: var(--mono);
  font-size: 2.8cqw;
  padding: 1cqw 2cqw;
  border-radius: 1cqw;
  background: rgba(255, 255, 255, 0.08);
}
h3 {
  margin: 0;
  font-size: 9.4cqw;
  line-height: 0.92;
  font-weight: 800;
  font-variation-settings: 'wdth' 80;
  letter-spacing: -0.02em;
}
.tag {
  font-size: 3cqw;
  opacity: 0.7;
  margin-top: 1cqw;
}
.dialwrap {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 3cqw;
  align-items: center;
  flex: 1;
  min-height: 0;
}
svg {
  width: 100%;
  max-height: 100%;
}
.kv {
  display: grid;
  gap: 2.6cqw;
}
.kv div {
  display: grid;
  border-top: 0.25cqw solid rgba(255, 255, 255, 0.18);
  padding-top: 1.2cqw;
}
.v {
  font-family: var(--display);
  font-size: 7.4cqw;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.v.small {
  font-size: 3.6cqw;
  line-height: 1.2;
}
.v small {
  font-size: 3.6cqw;
  opacity: 0.6;
  font-weight: 500;
}
.k {
  font-family: var(--mono);
  font-size: 2.1cqw;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.65;
  margin-top: 0.6cqw;
}
.nav {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  width: 100%;
  max-width: 540px;
}
.nav .chips {
  justify-content: center;
}
.nav .chips button {
  min-width: 34px;
  font-family: var(--mono);
}
.arrow {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--card);
  cursor: pointer;
  font-weight: 600;
}
.arrow:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
