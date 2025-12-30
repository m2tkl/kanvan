# Kanvan

Vue 3 Kanban board library with native drag-and-drop and slot customization. `src/lib` contains the library, and `src/App.vue` is the Playground for manual verification.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { KanbanBoard } from 'kanvan'

const columns = ref([
  {
    id: 'todo',
    title: 'Todo',
    items: [
      { id: 'a', title: 'Research' },
      { id: 'b', title: 'Design', description: 'API draft' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    items: [{ id: 'c', title: 'Initial setup' }],
  },
])
</script>

<template>
  <KanbanBoard v-model="columns" :columns="columns" />
</template>
```

## API

### Props

- `columns: KanbanColumn[]` (required) - initial data source for uncontrolled usage.
- `modelValue?: KanbanColumn[]` - controlled data source (takes precedence when provided).
- `debug?: boolean` - enable console logs for drag-and-drop.

### Emits

- `update:modelValue` - emits updated columns after a drop.
- `update:columns` - mirrors `update:modelValue` for convenience.
- `drag:start` - payload `{ columnId, itemId }`.
- `drag:over` - payload `{ columnId, itemId?, position? }`.
- `drag:drop` - payload `{ from: { columnId, itemId }, to: { columnId, beforeItemId? } }`.
- `drag:end` - payload `{ columnId, itemId, reason: 'drop' | 'cancel' }`.

### Slots

- `card` - customize card rendering.
  - `item: KanbanItem`
  - `column: KanbanColumn`
  - `isDragging: boolean`
  - `isPlaceholder: boolean`
- `column-header` - customize column header.
  - `column: KanbanColumn`
- `column-footer` - customize column footer.
  - `column: KanbanColumn`
- `empty-column` - shown when a column has no items.
  - `column: KanbanColumn`
- `placeholder` - customize the drop placeholder content.
  - `item: KanbanItem`
  - `column: KanbanColumn`

### Types

```ts
export type KanbanItem<Extra extends Record<string, unknown> = Record<string, unknown>> = {
  id: string
  title: string
  description?: string
} & Extra

export type KanbanColumn<Extra extends Record<string, unknown> = Record<string, unknown>> = {
  id: string
  title: string
  items: KanbanItem<Extra>[]
}
```

TypeScript users can extend item metadata via the `Extra` generic, but this is optional.

### Behavior

- Cards are moved with native HTML5 drag-and-drop.
- Placeholder height matches the dragged card size.
- Columns have a minimum width and the board scrolls horizontally when constrained.

## License

MIT
