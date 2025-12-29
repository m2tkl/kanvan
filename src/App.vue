<script setup lang="ts">
import { ref } from 'vue'
import type { KanbanColumn } from './lib/types'
import CustomBoardView from './components/playground/CustomBoardView.vue'
import DefaultBoardView from './components/playground/DefaultBoardView.vue'
import EventSidebar from './components/playground/EventSidebar.vue'
import GenericBoardView from './components/playground/GenericBoardView.vue'
import type { WorkItemMeta } from './components/playground/types'

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

      <DefaultBoardView
        v-if="activeView === 'default'"
        class="demo__board"
        v-model="defaultColumns"
        :debug="true"
        @drag:start="handleDragStart"
        @drag:over="handleDragOver"
        @drag:drop="handleDragDrop"
        @drag:end="handleDragEnd"
      />
      <CustomBoardView
        v-else-if="activeView === 'custom'"
        class="demo__board"
        v-model="customColumns"
        :debug="true"
        @drag:start="handleDragStart"
        @drag:over="handleDragOver"
        @drag:drop="handleDragDrop"
        @drag:end="handleDragEnd"
      />
      <GenericBoardView
        v-else
        class="demo__board"
        v-model="genericColumns"
        :debug="true"
        @drag:start="handleDragStart"
        @drag:over="handleDragOver"
        @drag:drop="handleDragDrop"
        @drag:end="handleDragEnd"
      />
    </div>
    <EventSidebar :entries="eventLog" :open="isSidebarOpen" @clear="clearLog" />
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

</style>
