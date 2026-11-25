<script setup lang="ts">
import { computed, ref } from 'vue'

import ChartRow from './chart/ChartRow.vue'
import HowWeRank from './chart/HowWeRank.vue'
import TopThree from './chart/TopThree.vue'
import { formatDay, loadChart, type LoadedChart } from './chart/load'

const props = defineProps<{ data?: LoadedChart }>()
const { chart, isSample } = props.data ?? loadChart()

const people = [...chart.people].sort((a, b) => a.rank - b.rank)
const max = Math.max(1, ...people.map((p) => p.crossovers))
const podium = people.slice(0, 3)

const query = ref('')
const open = ref<number | null>(null)

const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
const searching = computed(() => query.value.trim() !== '')
const rows = computed(() =>
  searching.value ? people.filter((p) => fold(p.name).includes(fold(query.value.trim()))) : people.slice(3),
)

const toggle = (rank: number) => (open.value = open.value === rank ? null : rank)
</script>

<template>
  <main>
    <header>
      <p class="kicker">40 for 40 · Day 18</p>
      <h1>{{ chart.title }}</h1>
      <p class="dek">
        The people the Guardian couldn't keep in one section, ranked by how many worlds they crossed into.
      </p>
      <p v-if="chart.window" class="window">
        {{ formatDay(chart.window.from) }} to {{ formatDay(chart.window.to) }}
      </p>
    </header>

    <p v-if="isSample" class="sample" role="note">
      Sample data. These people are made up while Samira pulls the real thing.
    </p>

    <TopThree :people="podium" :max="max" :open="open" @toggle="toggle" />

    <div class="tools">
      <label for="search" class="visually-hidden">Search by name</label>
      <input id="search" v-model="query" type="search" placeholder="Find someone" autocomplete="off" />
      <span class="legend"><b>#</b> = crossovers</span>
    </div>

    <ol class="list" aria-label="Ranking">
      <ChartRow
        v-for="person in rows"
        :key="person.rank"
        :person="person"
        :max="max"
        :open="open === person.rank"
        @toggle="toggle(person.rank)"
      />
    </ol>
    <p v-if="rows.length === 0" class="empty">Nobody by that name in the 100. Maybe next year.</p>

    <HowWeRank :method="chart.method" />

    <footer>
      Data: <a href="https://open-platform.theguardian.com/">The Guardian Open Platform</a>. People from Semrush's most
      searched list. Built live on <a href="https://www.twitch.tv/40for40">Twitch</a> by 40 for 40.
    </footer>
  </main>
</template>

<style scoped>
main {
  max-width: 46rem;
  margin: 0 auto;
  padding: 28px 16px 48px;
}
header {
  margin-bottom: 22px;
}
.kicker {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--signal-ink);
}
h1 {
  font-family: var(--display);
  font-weight: 900;
  font-size: clamp(44px, 12vw, 84px);
  line-height: 0.92;
  letter-spacing: -0.035em;
  margin: 0 0 14px;
}
.dek {
  font-size: 18px;
  line-height: 1.4;
  color: var(--ink-2);
  margin: 0 0 8px;
  max-width: 34rem;
}
.window {
  font-size: 13px;
  color: var(--muted);
  margin: 0;
}
.sample {
  background: var(--signal-soft);
  color: var(--signal-ink);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 14px;
  margin: 0 0 18px;
}
.tools {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}
input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--line);
  background: var(--card);
  border-radius: 999px;
  padding: 10px 16px;
}
.legend {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
}
.legend b {
  font-family: var(--display);
  color: var(--ink);
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.empty {
  color: var(--muted);
  padding: 20px 4px;
}
footer {
  margin-top: 28px;
  font-size: 12px;
  color: var(--muted);
}
footer a {
  color: inherit;
}
</style>
