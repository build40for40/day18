<script setup lang="ts">
import { computed, ref } from 'vue'

import { LANES, personLanes } from './lanes'
import PersonDetail from './PersonDetail.vue'
import type { Person } from './schema'
import { fold } from './searches'

const props = defineProps<{ people: Person[] }>()


const rows = computed(() => props.people.map((person) => ({ person, lanes: personLanes(person) })))
const homeLanes = computed(() => LANES.filter((l) => rows.value.some((r) => r.lanes.home === l.id)))

const query = ref('')
const lane = ref('all')
const open = ref<number | null>(null)
const toggle = (rank: number) => (open.value = open.value === rank ? null : rank)

const shown = computed(() => {
  const q = fold(query.value)
  return rows.value.filter(
    (r) => (!q || fold(r.person.name).includes(q)) && (lane.value === 'all' || r.lanes.home === lane.value),
  )
})

const percent = (share: number) => `${Math.round(share * 100)}%`
</script>

<template>
  <div class="index">
    <div class="tools">
      <label for="search" class="visually-hidden">Search by name</label>
      <input id="search" v-model="query" type="search" placeholder="Find someone" autocomplete="off" />
      <div class="filter">
        <span class="eyebrow">Known for</span>
        <div class="chips" role="group" aria-label="Filter by what they're known for">
          <button type="button" :aria-pressed="lane === 'all'" @click="lane = 'all'">All</button>
          <button v-for="l in homeLanes" :key="l.id" type="button" :aria-pressed="lane === l.id" @click="lane = l.id">
            {{ l.name }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid-head" aria-hidden="true">
      <span class="c-rank">#</span>
      <span class="c-name">Name</span>
      <span class="c-lanes">
        <span v-for="l in LANES" :key="l.id" class="lane-label"><span>{{ l.name }}</span></span>
      </span>
      <span class="c-num">Sections crossed</span>
      <span class="c-out">Coverage outside</span>
      <span class="c-art">Articles</span>
    </div>

    <ol class="list" aria-label="Ranking">
      <li v-for="{ person, lanes } in shown" :key="person.rank" :class="{ open: open === person.rank }">
        <button
          class="head"
          :aria-expanded="open === person.rank"
          :aria-controls="`detail-${person.rank}`"
          @click="toggle(person.rank)"
        >
          <span class="c-rank rank">{{ person.rank }}</span>
          <span class="c-name who">
            <span class="name">{{ person.name }}</span>
            <span v-if="person.home" class="home">{{ person.home }}</span>
          </span>
          <span class="c-lanes squares" :aria-label="`Crossed into ${lanes.crossed.size} other lanes`">
            <i
              v-for="l in LANES"
              :key="l.id"
              :class="{ hm: l.id === lanes.home, on: lanes.crossed.has(l.id) }"
              :title="l.name"
            />
          </span>
          <span class="c-num count">{{ person.crossovers }}</span>
          <span class="c-out bar">
            <template v-if="person.outsideShare !== undefined">
              <i :style="{ '--w': percent(person.outsideShare) }" />{{ percent(person.outsideShare) }}
            </template>
          </span>
          <span class="c-art articles">{{ (person.articlesTotal ?? person.articles)?.toLocaleString('en-GB') ?? '' }}</span>
        </button>
        <div v-if="open === person.rank" :id="`detail-${person.rank}`" class="body">
          <span class="eyebrow">Every section they crossed into</span>
          <PersonDetail :person="person" />
        </div>
      </li>
    </ol>
    <p v-if="shown.length === 0" class="empty">Nobody like that in the 100. Maybe next year.</p>

    <div class="legend">
      <span><i class="sq hm" />Known for</span>
      <span><i class="sq on" />Crossed into</span>
      <span><i class="sq" />Not yet</span>
      <span class="note">Tap anyone to see every section they crossed into.</span>
    </div>
  </div>
</template>

<style scoped>
.index {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
}
.tools {
  display: grid;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--line);
}
input {
  width: 100%;
  border: 1px solid var(--line);
  background: var(--bg);
  border-radius: 999px;
  padding: 10px 16px;
}
.filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

/* columns, desktop first */
.grid-head,
.head {
  display: grid;
  grid-template-columns: 3.2rem minmax(10rem, 1fr) auto 4.5rem 7.5rem 4.5rem;
  gap: 12px;
  align-items: center;
  padding: 0 16px;
}
.grid-head {
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  align-items: end;
  padding-top: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
}
.grid-head .c-rank,
.grid-head .c-num,
.grid-head .c-art {
  text-align: right;
}
.c-lanes {
  display: grid;
  grid-template-columns: repeat(12, 16px);
  gap: 4px;
}
.lane-label {
  display: flex;
  justify-content: center;
}
.lane-label span {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  letter-spacing: 0.04em;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.list li {
  border-bottom: 1px solid var(--faint);
}
.head {
  all: unset;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 3.2rem minmax(10rem, 1fr) auto 4.5rem 7.5rem 4.5rem;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 11px 16px;
  cursor: pointer;
}
.list li.open {
  background: color-mix(in srgb, var(--accent) 7%, transparent);
}
.body {
  display: grid;
  gap: 8px;
  padding: 2px 16px 18px calc(3.2rem + 28px);
}
.head:hover {
  background: var(--faint);
}
.head:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}
.rank {
  font-family: var(--display);
  font-weight: 800;
  font-size: 24px;
  line-height: 1;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-variation-settings: 'wdth' 85;
}
.who {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.name {
  font-weight: 600;
  font-size: 16px;
  line-height: 1.25;
  overflow-wrap: anywhere;
}
.home {
  font-size: 12px;
  color: var(--muted);
}
.squares i,
.sq {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: var(--faint);
}
.squares i.on,
.sq.on {
  background: var(--ink);
}
.squares i.hm,
.sq.hm {
  background: var(--accent);
}
.count {
  font-family: var(--display);
  font-weight: 700;
  font-size: 22px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--mono);
  font-size: 12px;
}
.bar i {
  display: block;
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--faint);
  position: relative;
  overflow: hidden;
}
.bar i::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--w);
  background: var(--accent);
  border-radius: 3px;
}
.articles {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  text-align: right;
}
.empty {
  color: var(--muted);
  padding: 24px 16px;
  margin: 0;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 12px 16px;
  font-size: 12px;
  color: var(--muted);
  border-top: 1px solid var(--line);
}
.legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.legend .sq {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

/* phone: rank, name with the lane strip under it, score */
@media (max-width: 760px) {
  .grid-head {
    display: none;
  }
  .head {
    grid-template-columns: 2.4rem minmax(0, 1fr) auto;
    grid-template-areas:
      'rank name num'
      'rank lanes num';
    row-gap: 6px;
    padding: 12px;
  }
  .c-rank {
    grid-area: rank;
  }
  .c-name {
    grid-area: name;
  }
  .c-lanes {
    grid-area: lanes;
    grid-template-columns: repeat(12, 10px);
    gap: 3px;
  }
  .squares i {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }
  .c-num {
    grid-area: num;
  }
  .c-out,
  .c-art {
    display: none;
  }
  .rank {
    font-size: 22px;
  }
  .body {
    padding: 2px 12px 16px;
  }
  }
</style>
