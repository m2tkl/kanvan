<script setup lang="ts">
import { computed, ref } from 'vue'
import { KanbanBoard } from './lib'
import type { KanbanColumn } from './lib/types'

const createColumns = (): KanbanColumn[] => [
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
]

const defaultColumns = ref(createColumns())
const customColumns = ref(
  createColumns().map((column) =>
    column.id === 'progress' ? { ...column, items: [] } : column,
  ),
)
const views = [
  { id: 'default', label: 'Default board' },
  { id: 'custom', label: 'Slot customized board' },
] as const
const activeView = ref<(typeof views)[number]['id']>('default')
const activeColumns = computed(() =>
  activeView.value === 'custom' ? customColumns.value : defaultColumns.value,
)
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
    <section class="demo__controls">
      <span class="demo__controls-label">Views</span>
      <div class="demo__tabs" role="tablist" aria-label="Playground views">
        <button
          v-for="view in views"
          :key="view.id"
          class="demo__tab"
          type="button"
          role="tab"
          :aria-selected="activeView === view.id"
          :data-active="activeView === view.id"
          @click="activeView = view.id"
        >
          {{ view.label }}
        </button>
      </div>
    </section>

    <KanbanBoard
      v-if="activeView === 'default'"
      class="demo__board"
      v-model="defaultColumns"
      :columns="defaultColumns"
      :debug="true"
    />
    <KanbanBoard
      v-else
      class="demo__board"
      v-model="customColumns"
      :columns="customColumns"
      :debug="true"
    >
      <template #column-header="{ column }">
        <div class="custom-header">
          <div>
            <p class="custom-header__eyebrow">Stage</p>
            <h2 class="custom-header__title">{{ column.title }}</h2>
          </div>
          <span class="custom-header__badge">{{ column.items.length }}</span>
        </div>
      </template>
      <template #card="{ item, column }">
        <article class="custom-card">
          <div class="custom-card__top">
            <span class="custom-card__pill">{{ column.title }}</span>
            <span class="custom-card__id">#{{ item.id }}</span>
          </div>
          <h3 class="custom-card__title">{{ item.title }}</h3>
          <p v-if="item.description" class="custom-card__description">
            {{ item.description }}
          </p>
        </article>
      </template>
      <template #empty-column="{ column }">
        <div class="custom-empty">
          <strong>{{ column.title }}</strong>
          <span>No cards yet. Drag one here.</span>
        </div>
      </template>
      <template #column-footer="{ column }">
        <button class="custom-footer" type="button">
          Add card to {{ column.title }}
        </button>
      </template>
    </KanbanBoard>
  </main>
</template>

<style scoped>
.demo {
  display: grid;
  gap: 24px;
  min-height: 0;
  height: 100%;
  grid-template-rows: auto auto 1fr;
}

.demo__header {
  display: grid;
  gap: 8px;
}

.demo__header,
.demo__controls {
  align-self: start;
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

.demo__board {
  min-height: 0;
  height: 100%;
}

.demo__controls {
  display: grid;
  gap: 8px;
}

.demo__controls-label {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.7rem;
  color: #6a645c;
}

.demo__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.demo__tab {
  border: 1px solid rgba(28, 27, 31, 0.2);
  background: #fff4da;
  color: #1c1b1f;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
  align-self: center;
  line-height: 1;
}

.demo__tab[data-active='true'] {
  background: #1c1b1f;
  color: #fff4da;
  border-color: #1c1b1f;
}

.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.custom-header__eyebrow {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #6a645c;
}

.custom-header__title {
  margin: 4px 0 0;
  font-size: 1.05rem;
}

.custom-header__badge {
  background: #1c1b1f;
  color: #fff4da;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
}

.custom-card {
  background: #1c1b1f;
  color: #fff4da;
  border-radius: 14px;
  padding: 10px 12px;
  height: 100%;
  display: grid;
  gap: 4px;
}

.custom-card__top {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 244, 218, 0.7);
}

.custom-card__pill {
  background: rgba(255, 244, 218, 0.16);
  padding: 2px 8px;
  border-radius: 999px;
}

.custom-card__id {
  font-size: 0.7rem;
}

.custom-card__title {
  margin: 0;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.custom-card__description {
  margin: 0;
  font-size: 0.78rem;
  color: rgba(255, 244, 218, 0.75);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.custom-empty {
  display: grid;
  gap: 4px;
  font-size: 0.9rem;
}

.custom-footer {
  width: 100%;
  border: 1px dashed rgba(28, 27, 31, 0.3);
  background: transparent;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}
</style>
