<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'
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
const previewColumns = ref<KanbanColumn[] | null>(null)
const renderColumns = computed(() => previewColumns.value ?? activeColumns.value)

const dragging = ref<{
  columnId: string
  itemId: string
} | null>(null)

const dragOver = ref<{
  columnId: string
  itemId?: string
  position?: 'before' | 'after'
} | null>(null)
const suppressMoveTransition = ref(false)
const dragImageElement = ref<HTMLElement | null>(null)
let scrollPositions: Map<string, number> | null = null
const slots = useSlots()

const emitUpdate = (columns: KanbanColumn[]) => {
  emit('update:modelValue', columns)
  emit('update:columns', columns)
}

const disableMoveTransition = () => {
  suppressMoveTransition.value = true
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      suppressMoveTransition.value = false
    })
  })
}

const log = (...args: unknown[]) => {
  if (!props.debug) return
  console.log('[KanbanBoard]', ...args)
}

const finalizeDrag = () => {
  if (dragImageElement.value) {
    dragImageElement.value.remove()
    dragImageElement.value = null
  }
  dragging.value = null
  dragOver.value = null
  clearPreview()
  if (scrollPositions) {
    const lists = document.querySelectorAll<HTMLElement>('.kanban-column__list')
    lists.forEach((list) => {
      const columnId = list.dataset.columnId
      if (!columnId) return
      const scrollTop = scrollPositions?.get(columnId)
      if (scrollTop === undefined) return
      list.scrollTop = scrollTop
    })
    scrollPositions = null
  }
}

const applyDrop = (
  columnId: string,
  itemId: string | undefined,
  position: 'before' | 'after' | undefined,
) => {
  if (!dragging.value) return
  const isSameColumn = dragging.value.columnId === columnId
  if (
    itemId &&
    itemId === dragging.value.itemId &&
    dragging.value.columnId === columnId
  ) {
    finalizeDrag()
    return
  }

  const beforeItemId = resolveBeforeItemId(columnId, itemId, position)
  const shouldMove = willMove(
    activeColumns.value,
    dragging.value.columnId,
    dragging.value.itemId,
    columnId,
    beforeItemId,
  )
  if (!shouldMove) {
    finalizeDrag()
    return
  }
  log('drop', {
    from: dragging.value,
    to: { columnId, beforeItemId },
  })

  const nextColumns = moveItem(
    activeColumns.value,
    dragging.value.columnId,
    dragging.value.itemId,
    columnId,
    beforeItemId,
  )
  emitUpdate(nextColumns)
  finalizeDrag()
  if (isSameColumn) {
    disableMoveTransition()
  }
}

const registerGlobalDragCleanup = () => {
  const handleDragEnd = () => {
    window.removeEventListener('dragend', handleDragEnd, true)
    window.removeEventListener('drop', handleDrop, true)
    window.removeEventListener('dragover', handleDragOver, true)
    finalizeDrag()
  }
  const handleDrop = (event: Event) => {
    const target = event.target
    if (target instanceof Element && target.closest('.kanban')) {
      return
    }
    window.removeEventListener('dragend', handleDragEnd, true)
    window.removeEventListener('drop', handleDrop, true)
    window.removeEventListener('dragover', handleDragOver, true)
    if (dragOver.value) {
      applyDrop(dragOver.value.columnId, dragOver.value.itemId, dragOver.value.position)
      return
    }
    finalizeDrag()
  }
  const handleDragOver = (event: DragEvent) => {
    if (!dragging.value) return
    event.preventDefault()
  }
  window.addEventListener('dragend', handleDragEnd, true)
  window.addEventListener('drop', handleDrop, true)
  window.addEventListener('dragover', handleDragOver, true)
}

const cloneColumns = (columns: KanbanColumn[]) =>
  columns.map((column) => ({
    ...column,
    items: column.items.map((item) => ({ ...item })),
  }))

const markPlaceholder = (item: KanbanItem) => {
  ;(item as KanbanItem & { __placeholder?: boolean }).__placeholder = true
}

const resolvePlaceholderItem = (columns: KanbanColumn[], itemId: string) => {
  for (const column of columns) {
    const item = column.items.find((entry) => entry.id === itemId)
    if (item) return item
  }
  return null
}

const buildPreviewColumns = (
  columns: KanbanColumn[],
  draggingState: { columnId: string; itemId: string },
  dropInfo?: { columnId: string; itemId?: string; position?: 'before' | 'after' },
) => {
  const nextColumns = cloneColumns(columns)
  const origin = findItem(
    nextColumns,
    draggingState.columnId,
    draggingState.itemId,
  )
  if (!origin) {
    const existing = resolvePlaceholderItem(nextColumns, draggingState.itemId)
    if (existing) {
      markPlaceholder(existing)
      return nextColumns
    }
    return columns
  }

  if (!dropInfo) {
    return nextColumns
  }

  const destinationOriginal = columns.find((entry) => entry.id === dropInfo.columnId)
  if (!destinationOriginal) return columns

  let targetIndex = destinationOriginal.items.length
  if (dropInfo.itemId) {
    const index = destinationOriginal.items.findIndex(
      (entry) => entry.id === dropInfo.itemId,
    )
    if (index !== -1) targetIndex = index
  }

  if (dropInfo.position === 'after') {
    targetIndex = Math.min(targetIndex + 1, destinationOriginal.items.length)
  }

  if (origin.column.id === destinationOriginal.id && origin.index < targetIndex) {
    targetIndex = Math.max(0, targetIndex - 1)
  }

  const destination = nextColumns.find((entry) => entry.id === dropInfo.columnId)
  if (!destination) return columns

  origin.column.items.splice(origin.index, 1)
  targetIndex = Math.min(targetIndex, destination.items.length)
  destination.items.splice(targetIndex, 0, origin.item)
  markPlaceholder(origin.item)
  return nextColumns
}

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
  dragOver.value = null
  clearPreview()
  log('drag:start', { columnId, itemId })
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) return
  scrollPositions = new Map<string, number>()
  const lists = document.querySelectorAll<HTMLElement>('.kanban-column__list')
  lists.forEach((list) => {
    const id = list.dataset.columnId
    if (!id) return
    scrollPositions?.set(id, list.scrollTop)
  })
  dataTransfer.setData('text/plain', `${columnId}:${itemId}`)
  const dragImage = document.createElement('div')
  dragImage.style.width = '1px'
  dragImage.style.height = '1px'
  dragImage.style.opacity = '0'
  dragImage.style.position = 'fixed'
  dragImage.style.top = '-1000px'
  dragImage.style.left = '-1000px'
  document.body.appendChild(dragImage)
  dragImageElement.value = dragImage
  dataTransfer.setDragImage(dragImage, 0, 0)
  dataTransfer.effectAllowed = 'move'
  registerGlobalDragCleanup()
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

const clearPreview = () => {
  previewColumns.value = null
}

const updatePreview = (
  columnId: string,
  itemId: string | undefined,
  position: 'before' | 'after' | undefined,
) => {
  if (!dragging.value) return
  const beforeItemId = resolveBeforeItemId(columnId, itemId, position)
  const shouldMove = willMove(
    activeColumns.value,
    dragging.value.columnId,
    dragging.value.itemId,
    columnId,
    beforeItemId,
  )
  if (shouldMove) {
    dragOver.value = { columnId, itemId, position }
    previewColumns.value = buildPreviewColumns(
      activeColumns.value,
      dragging.value,
      { columnId, itemId, position },
    )
  } else {
    dragOver.value = null
    clearPreview()
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
  const items = Array.from(list.querySelectorAll<HTMLElement>('[data-item-id]')).filter(
    (item) =>
      item.dataset.itemId !== dragging.value?.itemId &&
      item.dataset.placeholder !== 'true',
  )
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
      previewColumns.value = buildPreviewColumns(
        activeColumns.value,
        dragging.value,
        { columnId },
      )
    }
    if (!shouldMove) {
      dragOver.value = null
      clearPreview()
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
      updatePreview(columnId, best.id, best.position)
    } else {
      dragOver.value = null
      clearPreview()
    }
  }
}

const handleItemDragOver = (
  columnId: string,
  itemId: string,
  event: DragEvent,
) => {
  if (dragging.value?.itemId === itemId) return
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
    updatePreview(columnId, itemId, position)
  } else {
    dragOver.value = null
    clearPreview()
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
  const fallbackPosition = (() => {
    if (!itemId) return undefined
    const target = event.currentTarget as HTMLElement
    const bounds = target.getBoundingClientRect()
    return event.clientY - bounds.top > bounds.height / 2 ? 'after' : 'before'
  })()
  applyDrop(
    columnId,
    dropInfo?.itemId ?? itemId,
    dropInfo?.position ?? fallbackPosition,
  )
}

const handleDragEnd = () => {
  finalizeDrag()
  log('drag:end')
}

const handleBoardDrop = (event: DragEvent) => {
  event.preventDefault()
  if (!dragging.value) return
  if (event.target instanceof Element && event.target.closest('.kanban-column__list')) {
    return
  }
  if (dragOver.value) {
    applyDrop(dragOver.value.columnId, dragOver.value.itemId, dragOver.value.position)
    return
  }
  finalizeDrag()
}

const handleBoardDragOver = (event: DragEvent) => {
  if (!dragging.value) return
  event.preventDefault()
  event.dataTransfer && (event.dataTransfer.dropEffect = 'move')
}
</script>

<template>
  <section
    class="kanban"
    data-testid="kanban-board"
    @dragover="handleBoardDragOver"
    @drop="handleBoardDrop"
  >
    <KanbanColumnComponent
      v-for="column in renderColumns"
      :key="column.id"
      :column="column"
      :dragging="dragging"
      :drag-over="dragOver"
      :disable-move-transition="suppressMoveTransition"
      @list-dragover="handleListDragOver(column.id, $event)"
      @list-drop="handleDrop(column.id, undefined, $event)"
      @card-dragstart="handleDragStart(column.id, $event.itemId, $event.event)"
      @card-dragover="handleItemDragOver(column.id, $event.itemId, $event.event)"
      @card-drop="handleDrop(column.id, $event.itemId, $event.event)"
      @card-dragend="handleDragEnd"
    >
      <template v-if="slots.card" #card="slotProps">
        <slot name="card" v-bind="slotProps" />
      </template>
    </KanbanColumnComponent>
  </section>
</template>

<style scoped>
.kanban {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  min-height: 100%;
  align-items: stretch;
}
</style>
