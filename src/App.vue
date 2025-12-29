<script setup lang="ts">
import { computed, ref } from 'vue'
import { KanbanBoard } from './lib'
import type { KanbanColumn } from './lib/types'

type WorkItemMeta = {
  priority: 'low' | 'medium' | 'high'
  owner: string
}

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
const genericColumns = ref<KanbanColumn<WorkItemMeta>[]>([
  {
    id: 'triage',
    title: 'Triage',
    items: [
      {
        id: 'g-1',
        title: 'Review onboarding feedback',
        description: 'Highlight top friction points',
        priority: 'high',
        owner: 'Casey',
      },
      {
        id: 'g-2',
        title: 'Audit analytics naming',
        description: 'Align event taxonomy',
        priority: 'medium',
        owner: 'Jordan',
      },
    ],
  },
  {
    id: 'build',
    title: 'Build',
    items: [
      {
        id: 'g-3',
        title: 'Design QA checklist',
        description: 'Define visual baselines',
        priority: 'low',
        owner: 'Morgan',
      },
    ],
  },
  {
    id: 'ship',
    title: 'Ship',
    items: [],
  },
])
const views = [
  { id: 'default', label: 'Default board' },
  { id: 'custom', label: 'Slot customized board' },
  { id: 'generic', label: 'Generic typed board' },
] as const
const activeView = ref<(typeof views)[number]['id']>('default')
const activeColumns = computed(() => {
  if (activeView.value === 'custom') return customColumns.value
  if (activeView.value === 'generic') return genericColumns.value
  return defaultColumns.value
})
const eventLog = ref<
  Array<{
    id: string
    type: string
    timestamp: string
    payload: string
  }>
>([])

const formatPayload = (payload: unknown) =>
  JSON.stringify(payload, null, 0) ?? ''
const pushLog = (type: string, payload: unknown) => {
  eventLog.value.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    timestamp: new Date().toLocaleTimeString(),
    payload: formatPayload(payload),
  })
  if (eventLog.value.length > 12) {
    eventLog.value = eventLog.value.slice(0, 12)
  }
}

const handleDragStart = (payload: { columnId: string; itemId: string }) => {
  pushLog('drag:start', payload)
}

const handleDragOver = (payload: {
  columnId: string
  itemId?: string
  position?: 'before' | 'after'
}) => {
  pushLog('drag:over', payload)
}

const handleDragDrop = (payload: {
  from: { columnId: string; itemId: string }
  to: { columnId: string; beforeItemId?: string }
}) => {
  pushLog('drag:drop', payload)
}

const handleDragEnd = (payload: {
  columnId: string
  itemId: string
  reason: 'drop' | 'cancel'
}) => {
  pushLog('drag:end', payload)
}

const clearLog = () => {
  eventLog.value = []
}

const isSidebarOpen = ref(false)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <main class="demo" :data-sidebar-open="isSidebarOpen">
    <div class="demo__app">
      <header class="demo__header">
        <p class="demo__eyebrow">Kanvan Playground</p>
        <h1 class="demo__title">Kanban Library for Vue</h1>
        <p class="demo__lead">
          Use this space to preview components while building the library.
        </p>
      </header>
      <section class="demo__controls">
        <div>
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
        </div>
        <button
          class="demo__sidebar-toggle"
          type="button"
          :aria-expanded="isSidebarOpen"
          @click="toggleSidebar"
        >
          {{ isSidebarOpen ? 'Hide event log' : 'Show event log' }}
        </button>
      </section>

      <KanbanBoard
        v-if="activeView === 'default'"
        class="demo__board"
        v-model="defaultColumns"
        :columns="defaultColumns"
        :debug="true"
        @drag:start="handleDragStart"
        @drag:over="handleDragOver"
        @drag:drop="handleDragDrop"
        @drag:end="handleDragEnd"
      />
      <KanbanBoard
        v-else-if="activeView === 'custom'"
        class="demo__board"
        v-model="customColumns"
        :columns="customColumns"
        :debug="true"
        @drag:start="handleDragStart"
        @drag:over="handleDragOver"
        @drag:drop="handleDragDrop"
        @drag:end="handleDragEnd"
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
      <KanbanBoard
        v-else
        class="demo__board"
        v-model="genericColumns"
        :columns="genericColumns"
        :debug="true"
        @drag:start="handleDragStart"
        @drag:over="handleDragOver"
        @drag:drop="handleDragDrop"
        @drag:end="handleDragEnd"
      >
        <template #column-header="{ column }">
          <div class="generic-header">
            <div>
              <p class="generic-header__eyebrow">Workstream</p>
              <h2 class="generic-header__title">{{ column.title }}</h2>
            </div>
            <span class="generic-header__count">{{ column.items.length }}</span>
          </div>
        </template>
        <template #card="{ item }">
          <article class="generic-card">
            <div class="generic-card__meta">
              <span class="generic-card__priority" :data-level="item.priority">
                {{ item.priority }}
              </span>
              <span class="generic-card__owner">{{ item.owner }}</span>
            </div>
            <h3 class="generic-card__title">{{ item.title }}</h3>
            <p v-if="item.description" class="generic-card__description">
              {{ item.description }}
            </p>
          </article>
        </template>
        <template #empty-column="{ column }">
          <div class="generic-empty">
            <strong>{{ column.title }}</strong>
            <span>Drop a work item here.</span>
          </div>
        </template>
      </KanbanBoard>
    </div>
    <aside class="demo__sidebar" aria-label="Event log sidebar">
      <div class="demo__event-panel">
        <div class="demo__event-header">
          <span class="demo__controls-label">Event log</span>
          <button class="demo__event-clear" type="button" @click="clearLog">
            Clear
          </button>
        </div>
        <div class="demo__event-list" role="log" aria-live="polite">
          <p v-if="eventLog.length === 0" class="demo__event-empty">
            Drag a card to see events.
          </p>
          <div v-for="entry in eventLog" :key="entry.id" class="demo__event-row">
            <div class="demo__event-meta">
              <span class="demo__event-type">{{ entry.type }}</span>
              <span class="demo__event-time">{{ entry.timestamp }}</span>
            </div>
            <pre class="demo__event-payload">{{ entry.payload }}</pre>
          </div>
        </div>
      </div>
    </aside>
  </main>
</template>

<style scoped>
.demo {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 0;
  gap: 24px;
  min-height: 0;
  height: 100%;
  width: 100vw;
}

.demo[data-sidebar-open='true'] {
  grid-template-columns: minmax(0, 1fr) 420px;
}

.demo__header {
  display: grid;
  gap: 8px;
}

.demo__header,
.demo__controls {
  align-self: start;
}

.demo__app {
  display: grid;
  gap: 24px;
  padding: 40px 24px 64px;
  min-height: 0;
  height: 100%;
  grid-template-rows: auto auto 1fr;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.demo[data-sidebar-open='true'] .demo__app {
  max-width: none;
  margin: 0;
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
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
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

.demo__sidebar-toggle {
  border: 1px solid rgba(28, 27, 31, 0.2);
  background: #ffffff;
  color: #1c1b1f;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
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

.demo[data-sidebar-open='true'] .demo__sidebar {
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

.generic-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.generic-header__eyebrow {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #6a645c;
}

.generic-header__title {
  margin: 4px 0 0;
  font-size: 1.05rem;
}

.generic-header__count {
  background: #1c1b1f;
  color: #fff4da;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
}

.generic-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 12px;
  display: grid;
  gap: 6px;
  box-shadow: inset 0 0 0 1px rgba(28, 27, 31, 0.08);
}

.generic-card__meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #6a645c;
}

.generic-card__priority {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f4efe6;
  color: #1c1b1f;
  font-weight: 600;
}

.generic-card__priority[data-level='high'] {
  background: #ffe2c7;
  color: #6b2b00;
}

.generic-card__priority[data-level='medium'] {
  background: #fff4da;
  color: #7a5500;
}

.generic-card__priority[data-level='low'] {
  background: #e1f2e3;
  color: #1a5c2c;
}

.generic-card__owner {
  font-weight: 600;
}

.generic-card__title {
  margin: 0;
  font-size: 0.95rem;
}

.generic-card__description {
  margin: 0;
  font-size: 0.85rem;
  color: #4b4b4b;
}

.generic-empty {
  display: grid;
  gap: 4px;
  font-size: 0.9rem;
  color: #6a645c;
}
</style>
