<script setup lang="ts">
import { computed } from 'vue'
import { KanbanBoard } from '../../../../lib'
import type { KanbanColumn, KanbanItem } from '../../../../lib/types'

type TaskMeta = {
  tags?: string[]
  owner?: string
}

type TaskItem = KanbanItem<TaskMeta>

const props = defineProps<{
  modelValue: KanbanColumn<TaskMeta>[]
  debug?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: KanbanColumn<TaskMeta>[]): void
  (event: 'drag:start', payload: { columnId: string; itemId: string }): void
  (
    event: 'drag:over',
    payload: { columnId: string; itemId?: string; position?: 'before' | 'after' },
  ): void
  (
    event: 'drag:drop',
    payload: {
      from: { columnId: string; itemId: string }
      to: { columnId: string; beforeItemId?: string }
    },
  ): void
  (
    event: 'drag:end',
    payload: { columnId: string; itemId: string; reason: 'drop' | 'cancel' },
  ): void
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value: KanbanColumn<TaskMeta>[]) => emit('update:modelValue', value),
})

const getTags = (item: unknown) => (item as TaskItem).tags ?? []
const getOwner = (item: unknown) => (item as TaskItem).owner ?? ''
</script>

<template>
  <KanbanBoard
    v-model="model"
    :columns="model"
    :debug="props.debug"
    @drag:start="emit('drag:start', $event)"
    @drag:over="emit('drag:over', $event)"
    @drag:drop="emit('drag:drop', $event)"
    @drag:end="emit('drag:end', $event)"
  >
    <template #column-header="{ column }">
      <div class="task-header">
        <h2 class="task-header__title">{{ column.title }}</h2>
        <span class="task-header__count">{{ column.items.length }}</span>
      </div>
    </template>
    <template #card="{ item }">
      <article class="task-card">
        <div v-if="getTags(item).length" class="task-card__tags">
          <span v-for="tag in getTags(item)" :key="tag" class="task-card__tag">
            {{ tag }}
          </span>
        </div>
        <h3 class="task-card__title">{{ item.title }}</h3>
        <p v-if="item.description" class="task-card__description">
          {{ item.description }}
        </p>
        <span v-if="getOwner(item)" class="task-card__owner">{{ getOwner(item) }}</span>
      </article>
    </template>
  </KanbanBoard>
</template>

<style scoped>
.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.task-header__title {
  margin: 0;
  font-size: 1.05rem;
}

.task-header__count {
  border: 1px solid rgba(28, 27, 31, 0.2);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 0.8rem;
  color: #3d3a35;
}

.task-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 6px;
  box-shadow: inset 0 0 0 1px rgba(28, 27, 31, 0.08);
}

.task-card__tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.task-card__tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f4efe6;
  color: #5d564c;
  font-weight: 600;
}

.task-card__title {
  margin: 0;
  font-size: 0.95rem;
}

.task-card__description {
  margin: 0;
  font-size: 0.85rem;
  color: #4b4b4b;
}

.task-card__owner {
  font-size: 0.75rem;
  color: #6a645c;
  font-weight: 600;
}
</style>
