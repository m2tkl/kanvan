<script setup lang="ts">
import { computed } from 'vue'
import type { KanbanItem } from '../types'

const props = defineProps<{
  item: KanbanItem
  isDragging: boolean
  isPlaceholder: boolean
  placeholderHeight?: number | null
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

const placeholderStyle = computed(() => {
  if (!props.isPlaceholder || !props.placeholderHeight) return undefined
  return {
    height: `${props.placeholderHeight}px`,
    minHeight: `${props.placeholderHeight}px`,
  }
})
</script>

<template>
  <li
    class="kanban-card"
    :class="{ 'kanban-card--placeholder': props.isPlaceholder }"
    :style="placeholderStyle"
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
      <slot name="placeholder" :item="props.item" />
    </template>
    <template v-else>
      <slot
        :item="props.item"
        :is-dragging="props.isDragging"
        :is-placeholder="props.isPlaceholder"
      >
        <div class="kanban-card__body">
          <p class="kanban-card__title">{{ props.item.title }}</p>
          <p v-if="props.item.description" class="kanban-card__description">
            {{ props.item.description }}
          </p>
        </div>
      </slot>
    </template>
  </li>
</template>

<style scoped>
.kanban-card {
  cursor: grab;
  transition: box-shadow 120ms ease, opacity 120ms ease;
  position: relative;
  will-change: transform;
  min-height: 0;
  overflow: visible;
}

.kanban-card[data-dragging='true'] {
  opacity: 0.4;
  cursor: grabbing;
}

.kanban-card--placeholder {
  background: transparent;
  box-shadow: none;
  border: 1px dashed rgba(28, 27, 31, 0.3);
  min-height: 84px;
  border-radius: 12px;
  cursor: default;
  transition: none;
  pointer-events: none;
}

.kanban-card__body {
  background: #ffffff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: inset 0 0 0 1px rgba(28, 27, 31, 0.08);
  min-height: 84px;
  overflow: hidden;
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
