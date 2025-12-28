<script setup lang="ts">
import { computed, ref } from 'vue'
import type { KanbanColumn, KanbanItem } from '../types'
import KanbanColumnComponent from './KanbanColumn.vue'

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
  const target = event.currentTarget as HTMLElement
  const bounds = target.getBoundingClientRect()
  const offsetX = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left))
  const offsetY = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top))
  dataTransfer.setDragImage(target, offsetX, offsetY)
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
    <KanbanColumnComponent
      v-for="column in activeColumns"
      :key="column.id"
      :column="column"
      :dragging="dragging"
      :drag-over="dragOver"
      @list-dragover="handleListDragOver(column.id, $event)"
      @list-drop="handleDrop(column.id, undefined, $event)"
      @card-dragstart="handleDragStart(column.id, $event.itemId, $event.event)"
      @card-dragover="handleItemDragOver(column.id, $event.itemId, $event.event)"
      @card-drop="handleDrop(column.id, $event.itemId, $event.event)"
      @card-dragend="handleDragEnd"
    />
  </section>
</template>

<style scoped>
.kanban {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
</style>
