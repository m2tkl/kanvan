<script setup lang="ts">
import type { KanbanColumn } from '../types'
import KanbanCard from './KanbanCard.vue'

const props = defineProps<{
  column: KanbanColumn
  dragging: { columnId: string; itemId: string } | null
  dragOver:
    | { columnId: string; itemId?: string; position?: 'before' | 'after' }
    | null
}>()

const emit = defineEmits<{
  (event: 'list-dragover', eventValue: DragEvent): void
  (event: 'list-drop', eventValue: DragEvent): void
  (event: 'card-dragstart', payload: { itemId: string; event: DragEvent }): void
  (event: 'card-dragover', payload: { itemId: string; event: DragEvent }): void
  (event: 'card-drop', payload: { itemId: string; event: DragEvent }): void
  (event: 'card-dragend'): void
}>()

const isColumnDragOver = () => props.dragOver?.columnId === props.column.id
const isListDragOver = () =>
  props.dragOver?.columnId === props.column.id && !props.dragOver?.itemId
</script>

<template>
  <article class="kanban-column" :data-drag-over="isColumnDragOver()">
    <header class="kanban-column__header">
      <h2 class="kanban-column__title">{{ column.title }}</h2>
      <span class="kanban-column__count">{{ column.items.length }}</span>
    </header>
    <ol
      class="kanban-column__list"
      :data-drag-over="isListDragOver()"
      @dragover="emit('list-dragover', $event)"
      @drop="emit('list-drop', $event)"
    >
      <KanbanCard
        v-for="item in column.items"
        :key="item.id"
        :item="item"
        :is-dragging="dragging?.itemId === item.id"
        :is-drag-over="isColumnDragOver() && dragOver?.itemId === item.id"
        :drop-position="
          isColumnDragOver() && dragOver?.itemId === item.id ? dragOver?.position ?? null : null
        "
        @dragstart="emit('card-dragstart', { itemId: item.id, event: $event })"
        @dragover="emit('card-dragover', { itemId: item.id, event: $event })"
        @drop="emit('card-drop', { itemId: item.id, event: $event })"
        @dragend="emit('card-dragend')"
      />
    </ol>
  </article>
</template>

<style scoped>
.kanban-column {
  background: #f7f5f0;
  border-radius: 16px;
  padding: 16px;
  display: grid;
  gap: 12px;
  min-height: 260px;
  box-shadow: 0 10px 20px rgba(18, 18, 18, 0.08);
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.kanban-column[data-drag-over='true'] {
  box-shadow: 0 12px 30px rgba(18, 18, 18, 0.16);
  transform: translateY(-2px);
}

.kanban-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.kanban-column__title {
  font-size: 1.05rem;
  margin: 0;
}

.kanban-column__count {
  font-size: 0.9rem;
  background: #1c1b1f;
  color: #fff4da;
  padding: 4px 10px;
  border-radius: 999px;
}

.kanban-column__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
  position: relative;
}

.kanban-column__list[data-drag-over='true'] {
  padding-bottom: 18px;
}

.kanban-column__list[data-drag-over='true']::after {
  content: '';
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: 6px;
  height: 2px;
  border-radius: 999px;
  background: #1c1b1f;
}
</style>
