<script setup lang="ts">
defineProps<{ method: string[] }>()
</script>

<template>
  <section v-if="method.length" class="how" aria-labelledby="how-title">
    <h2 id="how-title">How we rank</h2>
    <ol>
      <li v-for="(line, index) in method" :key="index">{{ line }}</li>
    </ol>
  </section>
</template>

<style scoped>
.how {
  margin-top: 40px;
  padding: 22px;
  border-radius: 18px;
  background: var(--card);
  border: 1px solid var(--line);
}
h2 {
  font-family: var(--display);
  font-weight: 900;
  font-size: 26px;
  margin: 0 0 12px;
}
ol {
  margin: 0;
  padding-left: 1.3em;
  color: var(--ink-2);
}
li {
  margin: 6px 0;
}
li::marker {
  color: var(--signal);
  font-weight: 700;
}
</style>
