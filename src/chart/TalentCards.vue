<script setup lang="ts">
import { computed, ref } from 'vue'

import PersonCard from './PersonCard.vue'
import type { Person } from './schema'

const props = defineProps<{ people: Person[]; edition: string }>()

const top = computed(() => props.people.slice(0, 10))
const index = ref(0)
const person = computed(() => top.value[index.value] ?? top.value[0]!)
const step = (d: number) => (index.value = (index.value + d + top.value.length) % top.value.length)
</script>

<template>
  <div class="cards">
    <div class="live" aria-live="polite">
      <PersonCard :person="person" :edition="edition" :slide="`${index + 2} / ${top.length + 1}`" />
    </div>
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
.live {
  width: 100%;
  max-width: 540px;
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
