<script setup lang="ts">
import { ref } from 'vue'
import { KanbanBoard } from './lib'

const columns = ref([
  {
    id: 'backlog',
    title: 'Backlog',
    items: [
      { id: 'task-1', title: 'Design drag-and-drop flow' },
      { id: 'task-2', title: 'Card editing UI', description: 'Explore modal options' },
      { id: 'task-5', title: 'Accessibility sweep', description: 'Review focus and aria' },
      { id: 'task-6', title: 'Card slot API', description: 'Define slot props' },
      { id: 'task-7', title: 'Edge case checklist' },
      { id: 'task-8', title: 'Drag cancel UX', description: 'Decide fallback behavior' },
    ],
  },
  {
    id: 'progress',
    title: 'In Progress',
    items: [
      { id: 'task-3', title: 'Vue 3 testing foundation' },
      { id: 'task-9', title: 'Column sizing', description: 'Lock header height' },
      { id: 'task-10', title: 'Placeholder sync', description: 'Cross-column behavior' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    items: [
      { id: 'task-4', title: 'Initial design direction' },
      { id: 'task-11', title: 'Drop indicator', description: 'Replaced by skeleton' },
      { id: 'task-12', title: 'Preview cleanup' },
    ],
  },
])
</script>

<template>
  <main class="demo">
    <header class="demo__header">
      <p class="demo__eyebrow">Kanvan Playground</p>
      <h1 class="demo__title">Kanban Library for Vue</h1>
      <p class="demo__lead">
        Use this space to preview components while building the library.
      </p>
    </header>
    <KanbanBoard v-model="columns" :columns="columns" :debug="true" />
  </main>
</template>

<style scoped>
.demo {
  display: grid;
  gap: 24px;
  min-height: 0;
  height: 100%;
  grid-template-rows: auto 1fr;
}

.demo__header {
  display: grid;
  gap: 8px;
}

.demo__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  margin: 0;
}

.demo__title {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.8rem);
}

.demo__lead {
  margin: 0;
  color: #4b4b4b;
}
</style>
