<script setup lang="ts">
const props = defineProps<{
  open: boolean
  ariaLabel?: string
}>()
</script>

<template>
  <aside class="demo__sidebar" :data-open="props.open" :aria-label="props.ariaLabel">
    <slot />
  </aside>
</template>

<style scoped>
.demo__sidebar {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 28px 24px;
  overflow: hidden;
  background: #f4efe6;
  border-left: 2px solid rgba(28, 27, 31, 0.2);
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease;
}

.demo__sidebar[data-open='true'] {
  width: 100%;
  opacity: 1;
  pointer-events: auto;
}

.demo__sidebar[data-open='false'] {
  width: 0;
  padding: 0;
  border-left: 0;
}

@media (max-width: 900px) {
  .demo__sidebar {
    width: 100%;
    padding: 20px;
  }
}
</style>
