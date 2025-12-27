<script setup lang="ts">
import { computed, ref } from 'vue'
import type { KanbanColumn, KanbanItem } from '../types'

const props = defineProps<{
  columns: KanbanColumn[]
  modelValue?: KanbanColumn[]
  debug?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: KanbanColumn[]): void
  (event: 'update:columns', value: KanbanColumn[]): void
}>()

const activeColumns = computed(() => props.modelValue ?? props.columns)

const dragging = ref<{
  columnId: string
  itemId: string
} | null>(null)

const dragOver = ref<{
  columnId: string
  itemId?: string
  position?: 'before' | 'after'
} | null>(null)

const emitUpdate = (columns: KanbanColumn[]) => {
  emit('update:modelValue', columns)
  emit('update:columns', columns)
}

const log = (...args: unknown[]) => {
  if (!props.debug) return
  console.log('[KanbanBoard]', ...args)
}

const cloneColumns = (columns: KanbanColumn[]) =>
  columns.map((column) => ({
    ...column,
    items: [...column.items],
  }))

const findItem = (columns: KanbanColumn[], columnId: string, itemId: string) => {
  const column = columns.find((entry) => entry.id === columnId)
  if (!column) return null
  const index = column.items.findIndex((entry) => entry.id === itemId)
  if (index === -1) return null
  return { column, index, item: column.items[index] as KanbanItem }
}

const moveItem = (
  columns: KanbanColumn[],
  fromColumnId: string,
  itemId: string,
  toColumnId: string,
  beforeItemId?: string,
) => {
  const sourceOriginal = columns.find((entry) => entry.id === fromColumnId)
  const destinationOriginal = columns.find((entry) => entry.id === toColumnId)
  if (!sourceOriginal || !destinationOriginal) return columns

  let targetIndex = destinationOriginal.items.length
  if (beforeItemId) {
    const index = destinationOriginal.items.findIndex(
      (entry) => entry.id === beforeItemId,
    )
    if (index !== -1) targetIndex = index
  }

  const nextColumns = cloneColumns(columns)
  const origin = findItem(nextColumns, fromColumnId, itemId)
  const destination = nextColumns.find((entry) => entry.id === toColumnId)
  if (!origin || !destination) return columns

  origin.column.items.splice(origin.index, 1)

  if (origin.column.id === destination.id && origin.index < targetIndex) {
    targetIndex = Math.max(0, targetIndex - 1)
  }

  targetIndex = Math.min(targetIndex, destination.items.length)

  destination.items.splice(targetIndex, 0, origin.item)
  return nextColumns
}

const handleDragStart = (
  columnId: string,
  itemId: string,
  event: DragEvent,
) => {
  dragging.value = { columnId, itemId }
  dragOver.value = { columnId, itemId }
  log('drag:start', { columnId, itemId })
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) return
  dataTransfer.setData('text/plain', `${columnId}:${itemId}`)
  dataTransfer.setDragImage(event.currentTarget as Element, 12, 12)
  dataTransfer.effectAllowed = 'move'
}

const resolveBeforeItemId = (
  columnId: string,
  itemId: string | undefined,
  position: 'before' | 'after' | undefined,
) => {
  if (!itemId) return undefined
  if (position !== 'after') return itemId
  const column = activeColumns.value.find((entry) => entry.id === columnId)
  if (!column) return itemId
  const index = column.items.findIndex((entry) => entry.id === itemId)
  const next = column.items[index + 1]
  return next?.id
}

const willMove = (
  columns: KanbanColumn[],
  fromColumnId: string,
  itemId: string,
  toColumnId: string,
  beforeItemId?: string,
) => {
  const source = columns.find((entry) => entry.id === fromColumnId)
  const destination = columns.find((entry) => entry.id === toColumnId)
  if (!source || !destination) return false

  const originIndex = source.items.findIndex((entry) => entry.id === itemId)
  if (originIndex === -1) return false

  let targetIndex = destination.items.length
  if (beforeItemId) {
    const index = destination.items.findIndex((entry) => entry.id === beforeItemId)
    if (index !== -1) targetIndex = index
  }

  if (fromColumnId === toColumnId && originIndex < targetIndex) {
    targetIndex = Math.max(0, targetIndex - 1)
  }

  return !(fromColumnId === toColumnId && originIndex === targetIndex)
}

const clearDropIndicator = () => {
  if (dragOver.value) {
    dragOver.value = null
  }
}

const updateDropIndicator = (
  columnId: string,
  itemId: string,
  position: 'before' | 'after',
) => {
  if (
    dragOver.value?.columnId !== columnId ||
    dragOver.value?.itemId !== itemId ||
    dragOver.value?.position !== position
  ) {
    dragOver.value = { columnId, itemId, position }
    log('drag:over', { columnId, itemId, position })
  }
}

const handleListDragOver = (columnId: string, event: DragEvent) => {
  event.preventDefault()
  event.dataTransfer && (event.dataTransfer.dropEffect = 'move')
  if (!dragging.value) return

  const list = event.currentTarget as HTMLElement
  const items = Array.from(list.querySelectorAll<HTMLElement>('[data-item-id]'))
  if (items.length === 0) {
    const shouldMove = willMove(
      activeColumns.value,
      dragging.value.columnId,
      dragging.value.itemId,
      columnId,
      undefined,
    )
    if (shouldMove) {
      dragOver.value = { columnId }
      log('drag:over', { columnId, position: 'end' })
    } else {
      clearDropIndicator()
    }
    return
  }

  let best: { id: string; position: 'before' | 'after'; distance: number } | null =
    null
  for (const item of items) {
    const rect = item.getBoundingClientRect()
    const middle = rect.top + rect.height / 2
    const position = event.clientY < middle ? 'before' : 'after'
    const distance = Math.abs(event.clientY - middle)
    if (!best || distance < best.distance) {
      best = { id: item.dataset.itemId ?? '', position, distance }
    }
  }

  if (best && best.id) {
    const beforeItemId = resolveBeforeItemId(columnId, best.id, best.position)
    const shouldMove = willMove(
      activeColumns.value,
      dragging.value.columnId,
      dragging.value.itemId,
      columnId,
      beforeItemId,
    )
    if (shouldMove) {
      updateDropIndicator(columnId, best.id, best.position)
    } else {
      clearDropIndicator()
    }
  }
}

const handleItemDragOver = (
  columnId: string,
  itemId: string,
  event: DragEvent,
) => {
  event.preventDefault()
  event.dataTransfer && (event.dataTransfer.dropEffect = 'move')
  const target = event.currentTarget as HTMLElement
  const bounds = target.getBoundingClientRect()
  const position = event.clientY - bounds.top > bounds.height / 2 ? 'after' : 'before'
  const beforeItemId = resolveBeforeItemId(columnId, itemId, position)
  const shouldMove = willMove(
    activeColumns.value,
    dragging.value?.columnId ?? columnId,
    dragging.value?.itemId ?? itemId,
    columnId,
    beforeItemId,
  )
  if (shouldMove) {
    updateDropIndicator(columnId, itemId, position)
  } else {
    clearDropIndicator()
  }
}

const handleDrop = (
  columnId: string,
  itemId: string | undefined,
  event: DragEvent,
) => {
  event.preventDefault()
  if (!dragging.value) return
  const dropInfo = dragOver.value?.columnId === columnId ? dragOver.value : null
  if (
    dropInfo?.itemId &&
    dropInfo.itemId === dragging.value.itemId &&
    dragging.value.columnId === columnId
  ) {
    dragging.value = null
    dragOver.value = null
    return
  }

  const beforeItemId = resolveBeforeItemId(
    columnId,
    dropInfo?.itemId ?? itemId,
    dropInfo?.position,
  )
  const shouldMove = willMove(
    activeColumns.value,
    dragging.value.columnId,
    dragging.value.itemId,
    columnId,
    beforeItemId,
  )
  if (!shouldMove) {
    dragging.value = null
    dragOver.value = null
    return
  }
  log('drop', {
    from: dragging.value,
    to: { columnId, beforeItemId, dropInfo },
  })

  const nextColumns = moveItem(
    activeColumns.value,
    dragging.value.columnId,
    dragging.value.itemId,
    columnId,
    beforeItemId,
  )
  emitUpdate(nextColumns)
  dragging.value = null
  dragOver.value = null
}

const handleDragEnd = () => {
  dragging.value = null
  dragOver.value = null
  log('drag:end')
}
</script>

<template>
  <section class="kanban" data-testid="kanban-board">
    <article
      v-for="column in activeColumns"
      :key="column.id"
      class="kanban-column"
      :data-drag-over="dragOver?.columnId === column.id"
    >
      <header class="kanban-column__header">
        <h2 class="kanban-column__title">{{ column.title }}</h2>
        <span class="kanban-column__count">{{ column.items.length }}</span>
      </header>
      <ol
        class="kanban-column__list"
        :data-drag-over="dragOver?.columnId === column.id && !dragOver?.itemId"
        @dragover="handleListDragOver(column.id, $event)"
        @drop="handleDrop(column.id, undefined, $event)"
      >
        <li
          v-for="item in column.items"
          :key="item.id"
          class="kanban-card"
          :data-dragging="dragging?.itemId === item.id"
          :data-drag-over="dragOver?.columnId === column.id && dragOver?.itemId === item.id"
          :data-drop-position="
            dragOver?.columnId === column.id && dragOver?.itemId === item.id
              ? dragOver?.position
              : null
          "
          :data-item-id="item.id"
          draggable="true"
          @dragstart="handleDragStart(column.id, item.id, $event)"
          @dragover="handleItemDragOver(column.id, item.id, $event)"
          @drop="handleDrop(column.id, item.id, $event)"
          @dragend="handleDragEnd"
        >
          <p class="kanban-card__title">{{ item.title }}</p>
          <p v-if="item.description" class="kanban-card__description">
            {{ item.description }}
          </p>
        </li>
      </ol>
    </article>
  </section>
</template>

<style scoped>
.kanban {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

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

.kanban-card[data-drag-over='true'] {
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
