<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { LANES, laneName, personLanes } from '../chart/lanes'
import type { Person } from '../chart/schema'
import { searchesFor } from '../chart/searches'
import { dealRound, hotLine, scoreLine, shareText, verdictOf, type Verdict } from './hotOrNot'
import { fameLine, knownFor } from './knownFor'

const props = defineProps<{ people: Person[] }>()

const BEST_KEY = 'crossover-hot-or-not-best'
const SWIPE_AT = 90

const line = computed(() => hotLine(props.people))

const deck = ref<Person[]>([])
const at = ref(0)
const results = ref<boolean[]>([])
const guess = ref<Verdict | null>(null)
const best = ref(readBest())
const copied = ref(false)

const card = computed(() => deck.value[at.value])
const done = computed(() => deck.value.length > 0 && at.value >= deck.value.length)
const score = computed(() => results.value.filter(Boolean).length)
const truth = computed(() => (card.value ? verdictOf(card.value, line.value) : null))
const lanes = computed(() => (card.value ? personLanes(card.value) : null))
const searches = computed(() => (card.value ? searchesFor(card.value.name) : undefined))

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY) ?? 0) || 0
  } catch {
    return 0
  }
}

function start() {
  deck.value = dealRound(props.people, line.value)
  at.value = 0
  results.value = []
  guess.value = null
  copied.value = false
}

function choose(v: Verdict) {
  if (!card.value || guess.value) return
  guess.value = v
  results.value.push(v === truth.value)
  drag.value = 0
}

function next() {
  if (!guess.value) return
  guess.value = null
  at.value += 1
  if (done.value && score.value > best.value) {
    best.value = score.value
    try {
      localStorage.setItem(BEST_KEY, String(score.value))
    } catch {}
  }
}

const fame = computed(() => (card.value ? fameLine(card.value, searches.value) : ''))

const homeName = computed(() => (lanes.value?.home ? laneName(lanes.value.home) : card.value?.home ?? 'their lane'))
const known = computed(() => (card.value ? knownFor(card.value) : null))

const quip = computed(() => {
  if (!card.value || !guess.value) return ''
  const right = guess.value === truth.value
  const famous = (searches.value ?? 0) >= 1_000_000
  const quiet = searches.value !== undefined && searches.value < 500_000
  const verdict = right ? 'Correct.' : 'Nope.'
  if (truth.value === 'not' && famous) return `${verdict} Massively famous, but the paper mostly keeps them in ${homeName.value}.`
  if (truth.value === 'hot' && quiet) return `${verdict} Not that Googled, yet somehow in every section. Sneaky.`
  if (truth.value === 'hot') return right ? 'Correct. Every desk in the newsroom wants a piece.' : 'Nope. They get everywhere.'
  return right ? 'Correct. Big in their lane, quiet outside it.' : `Nope. They mostly stay in ${homeName.value}.`
})

// swiping
const drag = ref(0)
const startX = ref<number | null>(null)

function onDown(e: PointerEvent) {
  if (guess.value) return
  startX.value = e.clientX
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onMove(e: PointerEvent) {
  if (startX.value !== null) drag.value = e.clientX - startX.value
}
function onUp() {
  if (startX.value === null) return
  startX.value = null
  if (drag.value > SWIPE_AT) choose('hot')
  else if (drag.value < -SWIPE_AT) choose('not')
  else drag.value = 0
}

const tilt = computed(() => ({
  transform: `translateX(${drag.value}px) rotate(${drag.value / 18}deg)`,
  transition: startX.value === null ? 'transform 0.25s ease' : 'none',
}))
const lean = computed(() => (drag.value > 24 ? 'hot' : drag.value < -24 ? 'not' : null))

// keyboard: left is not, right is hot, enter moves on
const root = ref<HTMLElement | null>(null)
function onKey(e: KeyboardEvent) {
  if (!root.value || !isOnScreen(root.value)) return
  const target = e.target as HTMLElement | null
  if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return
  if (e.key === 'ArrowRight') choose('hot')
  else if (e.key === 'ArrowLeft') choose('not')
  else if (e.key === 'Enter' && guess.value) next()
  else return
  e.preventDefault()
}
function isOnScreen(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return r.top < window.innerHeight && r.bottom > 0
}

async function share() {
  const text = shareText(results.value, score.value, 'https://build40for40.com/crossover/#hot-or-not')
  try {
    if (navigator.share) await navigator.share({ text })
    else {
      await navigator.clipboard.writeText(text)
      copied.value = true
    }
  } catch {}
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
start()
</script>

<template>
  <div ref="root" class="game">
    <div class="head">
      <p class="eyebrow kicker">The Crossover 100 Index · Game</p>
      <h2 id="hot-title">Hot or Not</h2>
      <p class="rules">Influence... it's so hot right now.</p>
      <dl class="key">
        <div>
          <dt>🔥 Hot</dt>
          <dd>Crossed into {{ line }} or more sections of the paper</dd>
        </div>
        <div>
          <dt>🧊 Not</dt>
          <dd>Mostly stays in their lane</dd>
        </div>
      </dl>
      <p class="how">Swipe the card, tap a button, or use ← → and Enter.</p>
    </div>

    <div class="table">
      <div class="progress" :aria-label="`Card ${Math.min(at + 1, deck.length)} of ${deck.length}`">
        <i
          v-for="(_, i) in deck"
          :key="i"
          :class="{ right: results[i] === true, wrong: results[i] === false, now: i === at && !done }"
        />
      </div>

      <template v-if="!done && card">
        <div
          class="card"
          :class="[guess && (guess === truth ? 'is-right' : 'is-wrong'), lean && `lean-${lean}`]"
          :style="tilt"
          @pointerdown="onDown"
          @pointermove="onMove"
          @pointerup="onUp"
          @pointercancel="onUp"
        >
          <span class="stamp hot" aria-hidden="true">HOT 🔥</span>
          <span class="stamp not" aria-hidden="true">NOT 🧊</span>

          <p class="known">Known for {{ known?.label }}</p>
          <p class="name">{{ card.name }}</p>
          <p v-if="fame" class="fame">{{ fame }}</p>

          <div v-if="guess" class="reveal" aria-live="polite">
            <p class="verdict">{{ truth === 'hot' ? '🔥 Hot' : '🧊 Not' }}</p>
            <p class="facts">
              {{ card.crossovers }} {{ card.crossovers === 1 ? 'section' : 'sections' }} crossed · #{{ card.rank }} on
              the Index
            </p>
            <div class="squares" aria-hidden="true">
              <i
                v-for="l in LANES"
                :key="l.id"
                :class="{ hm: l.id === lanes?.home, on: lanes?.crossed.has(l.id) }"
                :title="l.name"
              />
            </div>
            <p v-if="known?.paper && !quip.includes(known.paper)" class="filed">The paper mostly files them under {{ known.paper }}.</p>
            <p class="quip">{{ quip }}</p>
          </div>
        </div>

        <div v-if="!guess" class="buttons">
          <button type="button" class="not" @click="choose('not')">🧊 Not</button>
          <button type="button" class="hot" @click="choose('hot')">Hot 🔥</button>
        </div>
        <div v-else class="buttons">
          <button type="button" class="next" @click="next">
            {{ at + 1 < deck.length ? 'Next person' : 'See my score' }}
          </button>
        </div>
      </template>

      <div v-else-if="done" class="end" aria-live="polite">
        <p class="big">{{ score }}/{{ deck.length }}</p>
        <p class="grid" aria-hidden="true">{{ results.map((r) => (r ? '✅' : '❌')).join('') }}</p>
        <p class="line">{{ scoreLine(score, deck.length) }}</p>
        <p class="best">Your best: {{ best }}/{{ deck.length }}</p>
        <div class="buttons">
          <button type="button" class="next" @click="start">Deal me 10 more</button>
          <button type="button" class="ghost" @click="share">{{ copied ? 'Copied!' : 'Share my score' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game {
  display: grid;
  gap: 20px;
}
.head {
  display: grid;
  gap: 6px;
}
.kicker {
  margin: 0;
  color: var(--accent);
}
h2 {
  margin: 0;
  font-size: clamp(30px, 5vw, 44px);
  font-weight: 800;
  font-variation-settings: 'wdth' 80;
  letter-spacing: -0.015em;
}
.rules {
  margin: 0;
  color: var(--muted);
  max-width: 62ch;
}
.key {
  display: grid;
  gap: 8px;
  margin: 8px 0 0;
}
.key div {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.key dt {
  flex: 0 0 auto;
  min-width: 4.6em;
  font-family: var(--display);
  font-weight: 800;
  font-size: 18px;
}
.key dd {
  margin: 0;
  color: var(--ink-2);
}
.how {
  margin: 8px 0 0;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
}

/* wide screens: the pitch on the left, the game on the right */
@media (min-width: 860px) {
  .game {
    grid-template-columns: minmax(0, 1fr) minmax(0, 420px);
    gap: 56px;
    align-items: center;
  }
  .head {
    gap: 10px;
  }
  h2 {
    font-size: clamp(56px, 7vw, 88px);
    line-height: 0.9;
  }
  .rules {
    font-size: 18px;
  }
  .table {
    margin: 0;
  }
  .table .card {
    min-height: 320px;
  }
}

.table {
  display: grid;
  gap: 16px;
  justify-items: center;
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
}
.progress {
  display: flex;
  gap: 6px;
}
.progress i {
  width: 22px;
  height: 6px;
  border-radius: 3px;
  background: var(--line);
}
.progress i.now {
  background: var(--accent);
}
.progress i.right {
  background: #ff5a8a;
}
.progress i.wrong {
  background: var(--muted);
}

.card {
  position: relative;
  width: 100%;
  min-height: 360px;
  padding: 28px 22px 22px;
  border-radius: 20px;
  background: var(--cobalt);
  color: var(--paper);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  touch-action: pan-y;
  user-select: none;
  cursor: grab;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(11, 11, 43, 0.08),
    0 24px 48px -24px rgba(11, 11, 43, 0.5);
}
.card:active {
  cursor: grabbing;
}
.card.is-right {
  outline: 4px solid var(--pink);
}
.card.is-wrong {
  animation: shake 0.35s;
}
@keyframes shake {
  25% {
    translate: -6px 0;
  }
  75% {
    translate: 6px 0;
  }
}
.known {
  margin: 0;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: var(--pink);
  color: var(--navy);
  padding: 4px 10px;
  border-radius: 999px;
}
.name {
  margin: 6px 0 0;
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(34px, 10vw, 48px);
  line-height: 0.95;
  font-variation-settings: 'wdth' 80;
  letter-spacing: -0.02em;
  text-wrap: balance;
}
.fame {
  margin: 0;
  font-family: var(--mono);
  font-size: 13px;
  opacity: 0.8;
}

.stamp {
  position: absolute;
  top: 18px;
  font-family: var(--display);
  font-weight: 800;
  font-size: 22px;
  padding: 4px 10px;
  border: 3px solid currentColor;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.1s;
}
.stamp.hot {
  left: 16px;
  color: var(--pink);
  rotate: -12deg;
}
.stamp.not {
  right: 16px;
  color: var(--paper);
  rotate: 12deg;
}
.lean-hot .stamp.hot,
.lean-not .stamp.not {
  opacity: 1;
}

.reveal {
  display: grid;
  gap: 6px;
  justify-items: center;
  margin-top: 12px;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--paper) 30%, transparent);
  width: 100%;
}
.verdict {
  margin: 0;
  font-family: var(--display);
  font-weight: 800;
  font-size: 30px;
  line-height: 1;
}
.facts {
  margin: 0;
  font-family: var(--mono);
  font-size: 13px;
}
.squares {
  display: grid;
  grid-template-columns: repeat(12, 14px);
  gap: 4px;
  margin: 4px 0;
}
.squares i {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--paper) 22%, transparent);
}
.squares i.on {
  background: var(--paper);
}
.squares i.hm {
  background: var(--pink);
}
.filed {
  margin: 0;
  font-family: var(--mono);
  font-size: 12px;
  opacity: 0.8;
}
.quip {
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
  max-width: 30ch;
}

.buttons {
  display: flex;
  gap: 10px;
  width: 100%;
}
.buttons button {
  flex: 1;
  border: 0;
  border-radius: 14px;
  padding: 15px 12px;
  font-weight: 700;
  font-size: 17px;
  cursor: pointer;
}
.buttons .hot {
  background: var(--pink);
  color: var(--navy);
}
.buttons .not {
  background: var(--card);
  color: var(--ink);
  border: 1px solid var(--line);
}
.buttons .next {
  background: var(--ink);
  color: var(--bg);
}
.buttons .ghost {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--line);
}

.end {
  display: grid;
  gap: 8px;
  justify-items: center;
  text-align: center;
  width: 100%;
}
.end p {
  margin: 0;
}
.big {
  font-family: var(--display);
  font-weight: 800;
  font-size: 72px;
  line-height: 1;
  font-variation-settings: 'wdth' 80;
}
.grid {
  font-size: 22px;
  letter-spacing: 2px;
}
.line {
  font-size: 17px;
  max-width: 34ch;
}
.best {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 8px !important;
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none !important;
  }
  .card.is-wrong {
    animation: none;
  }
}
</style>
