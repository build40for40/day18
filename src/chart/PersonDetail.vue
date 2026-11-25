<script setup lang="ts">
import type { Person } from './schema'

defineProps<{ person: Person }>()

const percent = (share: number) => `${Math.round(share * 100)}%`
</script>

<template>
  <div class="detail">
    <p class="facts">
      <span v-if="person.home">Home: <b>{{ person.home }}</b></span>
      <span v-if="person.articles !== undefined">{{ person.articles.toLocaleString('en-GB') }} articles</span>
      <span v-if="person.outsideShare !== undefined">{{ percent(person.outsideShare) }} outside home</span>
    </p>
    <ul v-if="person.sections?.length" class="sections">
      <li v-for="section in person.sections" :key="section.id">
        {{ section.title }} <span>{{ section.articles }}</span>
      </li>
    </ul>
    <p v-else class="facts">No crossovers yet. Stayed firmly in their lane.</p>
  </div>
</template>

<style scoped>
.detail {
  padding: 4px 0 4px;
}
.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--ink-2);
}
.sections {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.sections li {
  border: 1px solid var(--line);
  background: var(--paper);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 13px;
  font-weight: 500;
}
.sections span {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  margin-left: 2px;
}
</style>
