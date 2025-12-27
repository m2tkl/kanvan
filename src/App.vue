<script setup lang="ts">
import { KanbanBoard } from './lib'

const columns = [
  {
    id: 'backlog',
    title: 'Backlog',
    items: [
      { id: 'task-1', title: 'Design drag-and-drop flow' },
      { id: 'task-2', title: 'Card editing UI', description: 'Explore modal options' },
    ],
  },
  {
    id: 'progress',
    title: 'In Progress',
    items: [{ id: 'task-3', title: 'Vue 3 testing foundation' }],
  },
  {
    id: 'done',
    title: 'Done',
    items: [{ id: 'task-4', title: 'Initial design direction' }],
  },
]
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
    <KanbanBoard :columns="columns" />
  </main>
</template>

<style scoped>
.demo {
  display: grid;
  gap: 24px;
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
