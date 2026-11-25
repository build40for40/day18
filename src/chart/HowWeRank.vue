<script setup lang="ts">
import { LANES } from './lanes'

defineProps<{ method: string[] }>()

const names = LANES.map((l) => l.name)
const laneList = `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
</script>

<template>
  <section v-if="method.length" class="how" aria-labelledby="how-title">
    <h2 id="how-title">How we rank</h2>
    <ol>
      <li v-for="(line, index) in method" :key="index">{{ line }}</li>
      <li>
        The score counts every one of the Guardian's 82 sections. That's too many to show on a phone, so the grid groups
        them into {{ LANES.length }} lanes: {{ laneList }}. The lanes are only for display. The score counts sections.
      </li>
    </ol>
  </section>
</template>

<style scoped>
.how {
  padding: 24px;
  border-radius: 16px;
  background: var(--card);
  border: 1px solid var(--line);
}
h2 {
  font-weight: 800;
  font-size: 28px;
  font-variation-settings: 'wdth' 85;
  margin: 0 0 12px;
}
ol {
  margin: 0;
  padding-left: 1.4em;
  color: var(--ink-2);
  max-width: 62ch;
}
li {
  margin: 8px 0;
}
li::marker {
  color: var(--accent);
  font-family: var(--mono);
  font-weight: 500;
}
</style>
