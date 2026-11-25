<script setup lang="ts">
defineProps<{ count: number; max: number }>()
</script>

<template>
  <span class="meter" aria-hidden="true">
    <i v-for="n in max" :key="n" :class="{ on: n <= count }" />
  </span>
</template>

<style scoped>
.meter {
  display: inline-flex;
  gap: 2px;
  flex-wrap: wrap;
}
i {
  width: 6px;
  height: 12px;
  border-radius: 1.5px;
  background: var(--meter-off);
}
i.on {
  background: var(--signal);
}
</style>
