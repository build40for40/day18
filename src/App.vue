<script setup lang="ts">
import { nextTick, ref } from 'vue'

import FameChart from './chart/FameChart.vue'
import HowWeRank from './chart/HowWeRank.vue'
import IndexTable from './chart/IndexTable.vue'
import SwiftStory from './chart/SwiftStory.vue'
import { formatDay, loadChart, type LoadedChart } from './chart/load'

const props = defineProps<{ data?: LoadedChart }>()
const { chart, isSample } = props.data ?? loadChart()

const people = [...chart.people].sort((a, b) => a.rank - b.rank)
const edition = `${chart.window?.to.slice(0, 4) ?? '2026'} edition`

// The intro shows its first paragraph and a faded peek of the rest, so the list is one scroll away.
const expanded = ref(false)
const more = ref<HTMLElement | null>(null)
const moreHeight = ref<string | undefined>(undefined)
async function toggleIntro() {
  const el = more.value
  if (!el) return (expanded.value = !expanded.value)
  // animate between the faded peek and the real height, then let it size itself
  moreHeight.value = `${el.scrollHeight}px`
  if (expanded.value) {
    await nextTick()
    void el.offsetHeight // apply the pixel height before shrinking, so the close animates
    expanded.value = false
  } else {
    expanded.value = true
    setTimeout(settle, 500)
  }
}
const settle = () => {
  if (expanded.value) moreHeight.value = 'none'
}
</script>

<template>
  <main>
    <header class="hero">
      <p class="eyebrow kicker">40 for 40 · Day 18 · {{ edition }}</p>
      <h1>The Crossover <span>100</span> Index</h1>
      <p class="dek">The world's most truly influential people.</p>
      <div class="why">
        <p>
          Everyone knows we live in a more polarised world than ever, thanks to the algorithms. What I see and what you
          see are completely different. Something can be huge in my world all week and you've never heard of it. That's
          every feed: built for one person, shown to one person.
        </p>
        <div
          id="intro-more"
          ref="more"
          class="more"
          :class="{ open: expanded }"
          :style="expanded ? { maxHeight: moreHeight } : undefined"
        >
          <p>It also makes it harder to tell who has real cultural influence.</p>
          <p>
            But when a news story, a celebrity, an influencer or a meme crosses over from one category into another,
            that's when international conversations begin. An actress becomes the world's biggest fashion icon. The world's
            biggest pop star marries a future Hall of Fame NFL player. A tech CEO gets known for a black leather jacket and
            a possible relationship with a spy.
          </p>
          <p>
            So we took the world's most searched for people and read a year of Guardian coverage to count how many
            crossover stories each of them had. That's how we measure influence. Followers don't count. Fame alone
            doesn't win. It's all about the crossover.
          </p>
        </div>
        <button type="button" class="more-toggle" aria-controls="intro-more" :aria-expanded="expanded" @click="toggleIntro">
          {{ expanded ? 'Show less' : 'Read why we made this' }}
          <span class="chev" aria-hidden="true">↓</span>
        </button>
      </div>
      <p v-if="chart.window" class="window">
        Guardian coverage from {{ formatDay(chart.window.from) }} to {{ formatDay(chart.window.to) }}
      </p>
    </header>

    <p v-if="isSample" class="sample" role="note">
      Sample data. These people are made up while Samira pulls the real thing.
    </p>

    <section class="block" aria-labelledby="all-title">
      <div class="block-head">
        <h2 id="all-title">The top 100</h2>
        <p>
          Every row shows 12 lanes of the paper, so you can read a whole year at a glance. Ranked by how many Guardian
          sections they crossed into. Tap anyone to see every section they crossed into.
        </p>
      </div>
      <IndexTable :people="people" />
    </section>

    <section class="block" aria-label="Fame isn't influence">
      <FameChart :people="people" />
    </section>

    <section class="block" aria-label="Taylor Swift case study">
      <SwiftStory :rank="people.find((p) => p.name === 'Taylor Swift')?.rank" />
    </section>

    <section class="block">
      <HowWeRank :method="chart.method" />
    </section>

    <footer>
      Data: <a href="https://open-platform.theguardian.com/">The Guardian Open Platform</a>. People from Semrush's most
      searched list, plus a few hand-picked names. Built live on <a href="https://www.twitch.tv/40for40">Twitch</a> by
      40 for 40.
    </footer>
  </main>
</template>

<style scoped>
main {
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 16px 56px;
}
.hero {
  display: grid;
  gap: 12px;
  margin-bottom: 36px;
}
.kicker {
  margin: 0;
  color: var(--accent);
}
h1 {
  margin: 0;
  font-size: clamp(48px, 10vw, 112px);
  line-height: 0.88;
  font-weight: 800;
  font-variation-settings: 'wdth' 76;
  letter-spacing: -0.025em;
}
h1 span {
  color: var(--accent);
}
.dek {
  margin: 4px 0 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: clamp(24px, 4.4vw, 34px);
  letter-spacing: -0.01em;
}
.why {
  max-width: 62ch;
}
.why p {
  font-size: 17px;
  line-height: 1.6;
  color: var(--ink-2);
  margin: 0 0 12px;
}
.more {
  max-height: 4.9em;
  overflow: hidden;
  font-size: 17px;
  -webkit-mask-image: linear-gradient(to bottom, #000 15%, transparent);
  mask-image: linear-gradient(to bottom, #000 15%, transparent);
  transition: max-height 0.45s ease;
}
.more.open {
  -webkit-mask-image: none;
  mask-image: none;
}
.more p:last-child {
  margin-bottom: 4px;
}
.more-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding: 8px 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--card);
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.more-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.chev {
  display: inline-block;
  transition: transform 0.3s ease;
}
.more-toggle[aria-expanded='true'] .chev {
  transform: rotate(180deg);
}
@media (prefers-reduced-motion: reduce) {
  .more,
  .chev {
    transition: none;
  }
}
.window {
  margin: 0;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
}
.sample {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 14px;
  margin: 0 0 24px;
}
.block {
  padding-block: 36px;
  border-top: 1px solid var(--line);
}
.block-head {
  display: grid;
  gap: 6px;
  margin-bottom: 18px;
}
.block-head h2 {
  margin: 0;
  font-size: clamp(30px, 5vw, 44px);
  font-weight: 800;
  font-variation-settings: 'wdth' 80;
  letter-spacing: -0.015em;
}
.block-head p {
  margin: 0;
  color: var(--muted);
  max-width: 62ch;
}
footer {
  padding-top: 24px;
  font-size: 12px;
  color: var(--muted);
}
footer a {
  color: inherit;
}
@media (max-width: 860px) {
  }
</style>
