<script setup lang="ts">
import { computed } from 'vue'

import { LANES, personLanes } from './lanes'
import type { Person } from './schema'

const props = defineProps<{ people: Person[]; edition: string }>()

const rows = computed(() => props.people.slice(0, 10).map((person) => ({ person, lanes: personLanes(person) })))
</script>

<template>
  <figure class="plate" aria-labelledby="top10-title">
    <div class="poster top">
      <div class="brand"><span>The Crossover 100 Index</span><span>{{ edition }}</span></div>
      <h2 id="top10-title">Who crosses<br />the <em>most worlds</em></h2>
      <ol class="top-list" aria-label="Top 10">
        <li v-for="{ person, lanes } in rows" :key="person.rank">
          <span class="rk">{{ person.rank }}</span>
          <span class="nm">{{ person.name }}</span>
          <span class="dots" aria-hidden="true">
            <i
              v-for="lane in LANES"
              :key="lane.id"
              :class="{ hm: lane.id === lanes.home, on: lanes.crossed.has(lane.id) }"
            />
          </span>
          <span class="bn" :aria-label="`${person.crossovers} sections crossed`">{{ person.crossovers }}</span>
        </li>
      </ol>
      <div class="foot">
        <span>Pink: known for. White: lanes crossed into. Number: sections crossed.</span>
        <span>build40for40.com/crossover</span>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.top {
  aspect-ratio: 1 / 1;
  background: var(--cobalt);
  color: #fff;
  padding: 5.5cqw 6cqw 5cqw;
  gap: 2.2cqw;
}
h2 {
  margin: 0;
  font-size: 10.4cqw;
  line-height: 0.86;
  font-weight: 800;
  font-variation-settings: 'wdth' 76;
  letter-spacing: -0.02em;
}
h2 em {
  font-style: normal;
  color: var(--pink);
}
.top-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  flex: 1;
  align-content: space-between;
}
li {
  display: grid;
  grid-template-columns: 7.5cqw minmax(0, 1fr) auto 6.5cqw;
  align-items: center;
  gap: 2cqw;
  border-top: 0.25cqw solid rgba(255, 255, 255, 0.22);
  padding-top: 0.9cqw;
}
.rk {
  font-family: var(--display);
  font-weight: 800;
  font-size: 4.6cqw;
  line-height: 1;
  font-variation-settings: 'wdth' 80;
}
.nm {
  font-family: var(--display);
  font-weight: 600;
  font-size: 3.6cqw;
  line-height: 1.05;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dots {
  display: flex;
  gap: 0.7cqw;
}
.dots i {
  width: 1.7cqw;
  height: 1.7cqw;
  border-radius: 50%;
  border: 0.25cqw solid rgba(255, 255, 255, 0.35);
}
.dots i.on {
  background: #fff;
  border-color: #fff;
}
.dots i.hm {
  background: var(--pink);
  border-color: var(--pink);
}
.bn {
  font-family: var(--mono);
  font-size: 3.4cqw;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.foot {
  opacity: 0.85;
}
</style>
