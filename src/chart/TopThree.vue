<script setup lang="ts">
import CrossoverMeter from './CrossoverMeter.vue'
import PersonDetail from './PersonDetail.vue'
import type { Person } from './schema'

defineProps<{ people: Person[]; max: number; open: number | null }>()
defineEmits<{ toggle: [rank: number] }>()
</script>

<template>
  <ol class="podium" :class="{ stacked: open !== null && open <= 3 }" aria-label="Top three">
    <li v-for="person in people" :key="person.rank" :class="[`p${person.rank}`, { open: open === person.rank }]">
      <button
        class="card"
        :aria-expanded="open === person.rank"
        :aria-controls="`detail-${person.rank}`"
        @click="$emit('toggle', person.rank)"
      >
        <span class="rank">{{ person.rank }}</span>
        <span class="name">{{ person.name }}</span>
        <span class="line">
          <b>{{ person.crossovers }}</b> crossovers<template v-if="person.home"> from {{ person.home }}</template>
        </span>
        <CrossoverMeter :count="person.crossovers" :max="max" />
      </button>
      <div v-if="open === person.rank" :id="`detail-${person.rank}`" class="detail">
        <PersonDetail :person="person" />
      </div>
    </li>
  </ol>
</template>

<style scoped>
.podium {
  list-style: none;
  margin: 0 0 28px;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.p1,
.stacked li {
  grid-column: 1 / -1;
}
li {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
}
li:hover {
  border-color: var(--ink-2);
}
.p1 {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}
.card {
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
}
.card:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: -4px;
  border-radius: 16px;
}
.p1 .card {
  padding: 22px;
}
.rank {
  font-family: var(--display);
  font-weight: 900;
  font-size: 64px;
  line-height: 0.85;
  letter-spacing: -0.04em;
  color: var(--signal);
}
.p1 .rank {
  font-size: 112px;
}
.name {
  font-family: var(--display);
  font-weight: 700;
  font-size: clamp(17px, 4.8vw, 22px);
  line-height: 1.1;
  overflow-wrap: break-word;
  hyphens: auto;
}
.p1 .name {
  font-size: clamp(28px, 8vw, 34px);
}
.line {
  font-size: 13px;
  color: var(--ink-2);
}
.p1 .line {
  color: color-mix(in srgb, var(--paper) 75%, transparent);
}
.line b {
  color: inherit;
  font-weight: 700;
}
.p1 :deep(i:not(.on)) {
  background: color-mix(in srgb, var(--paper) 18%, transparent);
}
.detail {
  padding: 0 18px 18px;
}
.p1 .detail {
  padding: 0 22px 22px;
}
.p1 .detail :deep(.facts) {
  color: color-mix(in srgb, var(--paper) 75%, transparent);
}
.p1 .detail :deep(li) {
  background: color-mix(in srgb, var(--paper) 10%, transparent);
  border-color: color-mix(in srgb, var(--paper) 20%, transparent);
}
</style>
