<script setup lang="ts">
import CrossoverMeter from './CrossoverMeter.vue'
import PersonDetail from './PersonDetail.vue'
import type { Person } from './schema'

defineProps<{ person: Person; max: number; open: boolean }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <li class="row" :class="{ open }">
    <button
      class="head"
      :aria-expanded="open"
      :aria-controls="`detail-${person.rank}`"
      @click="$emit('toggle')"
    >
      <span class="rank">{{ person.rank }}</span>
      <span class="who">
        <span class="name">{{ person.name }}</span>
        <span v-if="person.home" class="home">{{ person.home }}</span>
      </span>
      <span class="score">
        <span class="count">{{ person.crossovers }}</span>
        <CrossoverMeter :count="person.crossovers" :max="max" class="meter" />
      </span>
    </button>
    <div v-if="open" :id="`detail-${person.rank}`" class="body">
      <PersonDetail :person="person" />
    </div>
  </li>
</template>

<style scoped>
.row {
  border-bottom: 1px solid var(--line);
}
.head {
  all: unset;
  box-sizing: border-box;
  width: 100%;
  display: grid;
  grid-template-columns: 3.2rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 14px 4px;
  cursor: pointer;
}
.head:hover .name {
  color: var(--signal-ink);
}
.head:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: -2px;
  border-radius: 8px;
}
.rank {
  font-family: var(--display);
  font-weight: 900;
  font-size: 30px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
.who {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.name {
  font-weight: 650;
  font-size: 17px;
  line-height: 1.25;
  overflow-wrap: anywhere;
}
.home {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}
.score {
  display: flex;
  align-items: center;
  gap: 10px;
}
.count {
  font-family: var(--display);
  font-weight: 700;
  font-size: 22px;
  font-variant-numeric: tabular-nums;
  min-width: 1.6ch;
  text-align: right;
}
.body {
  padding: 0 4px 16px calc(3.2rem + 16px);
}
@media (max-width: 560px) {
  .meter {
    display: none;
  }
  .body {
    padding-left: 4px;
  }
  .rank {
    font-size: 26px;
  }
  .head {
    grid-template-columns: 2.6rem minmax(0, 1fr) auto;
  }
}
</style>
