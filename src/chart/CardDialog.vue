<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import PersonCard from './PersonCard.vue'
import PersonDetail from './PersonDetail.vue'
import type { Person } from './schema'

const props = defineProps<{ people: Person[]; edition: string }>()
const rank = defineModel<number | null>('rank', { required: true })

const index = computed(() => props.people.findIndex((p) => p.rank === rank.value))
const person = computed(() => props.people[index.value])
const closeButton = ref<HTMLButtonElement | null>(null)
let returnFocus: HTMLElement | null = null

const close = () => (rank.value = null)
const step = (d: number) => {
  const n = props.people.length
  rank.value = props.people[(index.value + d + n) % n]?.rank ?? null
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
}

watch(
  () => rank.value !== null,
  async (isOpen) => {
    if (typeof document === 'undefined') return
    if (isOpen) {
      returnFocus = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
      await nextTick()
      closeButton.value?.focus()
    } else {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      returnFocus?.focus()
    }
  },
)
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div v-if="person" class="overlay" @click.self="close">
    <div class="dialog" role="dialog" aria-modal="true" :aria-label="`${person.name}'s card`">
      <div class="bar">
        <button type="button" class="round" aria-label="Previous person" @click="step(-1)">←</button>
        <span class="eyebrow">#{{ person.rank }} of {{ people.length }}</span>
        <button type="button" class="round" aria-label="Next person" @click="step(1)">→</button>
        <button ref="closeButton" type="button" class="round close" aria-label="Close card" @click="close">✕</button>
      </div>
      <PersonCard :person="person" :edition="edition" />
      <div class="sections">
        <span class="eyebrow">Every section they crossed into</span>
        <PersonDetail :person="person" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(9, 10, 28, 0.72);
  backdrop-filter: blur(6px);
  overflow-y: auto;
  padding: max(16px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px))
    max(24px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.dialog {
  width: 100%;
  max-width: 540px;
  display: grid;
  gap: 12px;
  margin: auto 0;
}
.bar {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bar .eyebrow {
  color: #fff;
  opacity: 0.8;
  flex: 1;
  text-align: center;
}
.round {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}
.round:hover {
  background: rgba(255, 255, 255, 0.18);
}
.close {
  margin-left: 6px;
}
.sections {
  display: grid;
  gap: 8px;
  background: var(--card);
  border-radius: 12px;
  padding: 14px 16px;
}
</style>
