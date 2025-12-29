<script setup lang="ts">
import { useSlots } from 'vue'
import type { KanbanColumn } from '../types'
import KanbanCard from './KanbanCard.vue'

const props = defineProps<{
  column: KanbanColumn
  dragging: { columnId: string; itemId: string } | null
  dragOver:
    | { columnId: string; itemId?: string; position?: 'before' | 'after' }
    | null
  disableMoveTransition: boolean
  placeholderHeight?: number | null
}>()

const emit = defineEmits<{
  (event: 'list-dragover', eventValue: DragEvent): void
  (event: 'list-drop', eventValue: DragEvent): void
  (event: 'card-dragstart', payload: { itemId: string; event: DragEvent }): void
  (event: 'card-dragover', payload: { itemId: string; event: DragEvent }): void
  (event: 'card-drop', payload: { itemId: string; event: DragEvent }): void
  (event: 'card-dragend'): void
}>()

const slots = useSlots()
const isColumnDragOver = () => props.dragOver?.columnId === props.column.id
const isListDragOver = () =>
  props.dragOver?.columnId === props.column.id && !props.dragOver?.itemId
const isPlaceholder = (item: KanbanColumn['items'][number]) =>
  (item as { __placeholder?: boolean }).__placeholder === true
</script>

<template>
  <article class="kanban-column" :data-drag-over="isColumnDragOver()">
    <header class="kanban-column__header">
      <template v-if="slots['column-header']">
        <slot name="column-header" :column="column" />
      </template>
      <template v-else>
        <h2 class="kanban-column__title">{{ column.title }}</h2>
        <span class="kanban-column__count">{{ column.items.length }}</span>
      </template>
    </header>
    <TransitionGroup
      tag="ol"
      class="kanban-column__list"
      :class="{
        'kanban-column__list--freeze': props.disableMoveTransition,
        'kanban-column__list--lock': props.dragging?.columnId === column.id,
      }"
      name="kanban-card"
      :data-drag-over="isListDragOver()"
      :data-column-id="column.id"
      @dragover="emit('list-dragover', $event)"
      @drop="emit('list-drop', $event)"
    >
      <template v-for="item in column.items" :key="item.id">
        <KanbanCard
          v-if="slots.card"
          :item="item"
          :is-dragging="dragging?.itemId === item.id"
          :is-placeholder="isPlaceholder(item)"
          :placeholder-height="props.placeholderHeight"
          @dragstart="emit('card-dragstart', { itemId: item.id, event: $event })"
          @dragover="emit('card-dragover', { itemId: item.id, event: $event })"
          @drop="emit('card-drop', { itemId: item.id, event: $event })"
          @dragend="emit('card-dragend')"
        >
          <template v-if="!isPlaceholder(item)">
            <slot
              name="card"
              :item="item"
              :column="column"
              :is-dragging="dragging?.itemId === item.id"
              :is-placeholder="isPlaceholder(item)"
            />
          </template>
          <template v-if="slots.placeholder" #placeholder>
            <slot name="placeholder" :item="item" :column="column" />
          </template>
        </KanbanCard>
        <KanbanCard
          v-else
          :item="item"
          :is-dragging="dragging?.itemId === item.id"
          :is-placeholder="isPlaceholder(item)"
          :placeholder-height="props.placeholderHeight"
          @dragstart="emit('card-dragstart', { itemId: item.id, event: $event })"
          @dragover="emit('card-dragover', { itemId: item.id, event: $event })"
          @drop="emit('card-drop', { itemId: item.id, event: $event })"
          @dragend="emit('card-dragend')"
        >
          <template v-if="slots.placeholder" #placeholder>
            <slot name="placeholder" :item="item" :column="column" />
          </template>
        </KanbanCard>
      </template>
      <li
        v-if="slots['empty-column'] && column.items.length === 0"
        :key="`empty-${column.id}`"
        class="kanban-column__empty"
      >
        <slot name="empty-column" :column="column" />
      </li>
    </TransitionGroup>
    <footer v-if="slots['column-footer']" class="kanban-column__footer">
      <slot name="column-footer" :column="column" />
    </footer>
  </article>
</template>

<style scoped>
.kanban-column {
  background: #f7f5f0;
  border-radius: 16px;
  padding: 16px;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 12px;
  min-height: 260px;
  height: 100%;
  box-shadow: 0 10px 20px rgba(18, 18, 18, 0.08);
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.kanban-column[data-drag-over='true'] {
  box-shadow: 0 12px 30px rgba(18, 18, 18, 0.16);
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
  min-height: 0;
  overflow-y: auto;
  overflow-anchor: none;
  align-content: start;
  align-items: start;
  grid-auto-rows: max-content;
}

.kanban-column__list--lock {
  overflow-y: auto;
}

.kanban-column__footer {
  margin-top: 8px;
}

.kanban-column__empty {
  border: 1px dashed rgba(28, 27, 31, 0.2);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  color: #6a645c;
  font-size: 0.9rem;
}
</style>

<style>
.kanban-column__list--freeze .kanban-card-move,
.kanban-column__list--freeze .kanban-card {
  transition: none;
}
</style>
