<script setup lang="ts">
type EventEntry = {
  id: string
  type: string
  timestamp: string
  payload: string
}

const props = defineProps<{
  entries: EventEntry[]
  open: boolean
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()
</script>

<template>
  <aside class="demo__sidebar" :data-open="props.open" aria-label="Event log sidebar">
    <div class="demo__event-panel">
      <div class="demo__event-header">
        <span class="demo__controls-label">Event log</span>
        <button class="demo__event-clear" type="button" @click="emit('clear')">
          Clear
        </button>
      </div>
      <div class="demo__event-list" role="log" aria-live="polite">
        <p v-if="props.entries.length === 0" class="demo__event-empty">
          Drag a card to see events.
        </p>
        <div v-for="entry in props.entries" :key="entry.id" class="demo__event-row">
          <div class="demo__event-meta">
            <span class="demo__event-type">{{ entry.type }}</span>
            <span class="demo__event-time">{{ entry.timestamp }}</span>
          </div>
          <pre class="demo__event-payload">{{ entry.payload }}</pre>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.demo__controls-label {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.7rem;
  color: #6a645c;
}

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
  opacity: 1;
  pointer-events: auto;
}

.demo__event-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #ffffff;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: inset 0 0 0 1px rgba(28, 27, 31, 0.08);
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.demo__event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.demo__event-clear {
  border: 1px solid rgba(28, 27, 31, 0.2);
  background: #ffffff;
  color: #1c1b1f;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.demo__event-list {
  display: grid;
  gap: 8px;
  align-content: start;
  min-height: 0;
  max-height: none;
  flex: 1;
  overflow: auto;
  padding-right: 4px;
}

.demo__event-empty {
  margin: 0;
  font-size: 0.85rem;
  color: #6a645c;
}

.demo__event-row {
  background: #fff4da;
  border-radius: 10px;
  padding: 8px 10px;
  display: grid;
  gap: 6px;
  border: 1px solid rgba(28, 27, 31, 0.08);
}

.demo__event-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6a645c;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.demo__event-type {
  color: #1c1b1f;
  font-weight: 600;
}

.demo__event-payload {
  margin: 0;
  font-size: 0.8rem;
  background: #ffffff;
  padding: 6px 8px;
  border-radius: 8px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 900px) {
  .demo__sidebar {
    width: 100%;
    padding: 20px;
  }
}
</style>
