<script setup lang="ts">
import type { KanbanItem } from '../types'

const props = defineProps<{
  item: KanbanItem
  isDragging: boolean
  isPlaceholder: boolean
}>()

const emit = defineEmits<{
  (event: 'dragstart', eventValue: DragEvent): void
  (event: 'dragover', eventValue: DragEvent): void
  (event: 'drop', eventValue: DragEvent): void
  (event: 'dragend'): void
}>()

const handleDragStart = (event: DragEvent) => {
  if (props.isPlaceholder) return
  emit('dragstart', event)
}

const handleDragOver = (event: DragEvent) => {
  if (props.isPlaceholder) return
  emit('dragover', event)
}

const handleDrop = (event: DragEvent) => {
  if (props.isPlaceholder) return
  emit('drop', event)
}
</script>

<template>
  <li
    class="kanban-card"
    :class="{ 'kanban-card--placeholder': props.isPlaceholder }"
    :data-dragging="props.isDragging"
    :data-item-id="props.item.id"
    :data-placeholder="props.isPlaceholder"
    :draggable="props.isDragging || !props.isPlaceholder"
    @dragstart="handleDragStart"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @dragend="emit('dragend')"
  >
    <template v-if="props.isPlaceholder">
      <div class="kanban-card__skeleton" aria-hidden="true"></div>
    </template>
    <template v-else>
      <slot
        :item="props.item"
        :is-dragging="props.isDragging"
        :is-placeholder="props.isPlaceholder"
      >
        <p class="kanban-card__title">{{ props.item.title }}</p>
        <p v-if="props.item.description" class="kanban-card__description">
          {{ props.item.description }}
        </p>
      </slot>
    </template>
  </li>
</template>

<style scoped>
.kanban-card {
  --kanban-card-height: 84px;
  background: #ffffff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: inset 0 0 0 1px rgba(28, 27, 31, 0.08);
  cursor: grab;
  transition: box-shadow 120ms ease, opacity 120ms ease;
  position: relative;
  will-change: transform;
  height: var(--kanban-card-height);
  overflow: hidden;
}

.kanban-card[data-dragging='true'] {
  opacity: 0.4;
  cursor: grabbing;
}

.kanban-card--placeholder {
  background: transparent;
  box-shadow: none;
  border: 1px dashed rgba(28, 27, 31, 0.3);
  height: var(--kanban-card-height);
  cursor: default;
  transition: none;
  pointer-events: none;
}

.kanban-card__skeleton {
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #e7e0d4 0%, #f6efe3 50%, #e7e0d4 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.kanban-card__title {
  margin: 0 0 4px;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kanban-card__description {
  margin: 0;
  font-size: 0.85rem;
  color: #4b4b4b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
