<script setup lang="ts">
import type { KanbanItem } from '../types'

defineProps<{
  item: KanbanItem
  isDragging: boolean
  isDragOver: boolean
  dropPosition: 'before' | 'after' | null
}>()
</script>

<template>
  <li
    class="kanban-card"
    :data-dragging="isDragging"
    :data-drag-over="isDragOver"
    :data-drop-position="dropPosition"
    :data-item-id="item.id"
    draggable="true"
  >
    <p class="kanban-card__title">{{ item.title }}</p>
    <p v-if="item.description" class="kanban-card__description">
      {{ item.description }}
    </p>
  </li>
</template>

<style scoped>
.kanban-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: inset 0 0 0 1px rgba(28, 27, 31, 0.08);
  cursor: grab;
  transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
  position: relative;
}

.kanban-card[data-dragging='true'] {
  opacity: 0.4;
  cursor: grabbing;
}

.kanban-card[data-drop-position='before']::before,
.kanban-card[data-drop-position='after']::after {
  content: '';
  position: absolute;
  left: 6px;
  right: 6px;
  height: 2px;
  border-radius: 999px;
  background: #1c1b1f;
}

.kanban-card[data-drop-position='before']::before {
  top: -6px;
}

.kanban-card[data-drop-position='after']::after {
  bottom: -6px;
}

.kanban-card__title {
  margin: 0 0 4px;
  font-weight: 600;
}

.kanban-card__description {
  margin: 0;
  font-size: 0.85rem;
  color: #4b4b4b;
}
</style>
