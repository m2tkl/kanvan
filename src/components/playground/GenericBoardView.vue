<script setup lang="ts">
import { computed } from 'vue'
import { KanbanBoard } from '../../lib'
import type { KanbanColumn } from '../../lib/types'
import type { WorkItemMeta } from './types'

const props = defineProps<{
  modelValue: KanbanColumn<WorkItemMeta>[]
  debug?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: KanbanColumn<WorkItemMeta>[]): void
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
  set: (value: KanbanColumn<WorkItemMeta>[]) => emit('update:modelValue', value),
})
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
      <div class="generic-header">
        <div>
          <p class="generic-header__eyebrow">Workstream</p>
          <h2 class="generic-header__title">{{ column.title }}</h2>
        </div>
        <span class="generic-header__count">{{ column.items.length }}</span>
      </div>
    </template>
    <template #card="{ item }">
      <article class="generic-card">
        <div class="generic-card__meta">
          <span class="generic-card__priority" :data-level="item.priority">
            {{ item.priority }}
          </span>
          <span class="generic-card__owner">{{ item.owner }}</span>
        </div>
        <h3 class="generic-card__title">{{ item.title }}</h3>
        <p v-if="item.description" class="generic-card__description">
          {{ item.description }}
        </p>
      </article>
    </template>
    <template #empty-column="{ column }">
      <div class="generic-empty">
        <strong>{{ column.title }}</strong>
        <span>Drop a work item here.</span>
      </div>
    </template>
  </KanbanBoard>
</template>

<style scoped>
.generic-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.generic-header__eyebrow {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #6a645c;
}

.generic-header__title {
  margin: 4px 0 0;
  font-size: 1.05rem;
}

.generic-header__count {
  background: #1c1b1f;
  color: #fff4da;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
}

.generic-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 12px;
  display: grid;
  gap: 6px;
  box-shadow: inset 0 0 0 1px rgba(28, 27, 31, 0.08);
}

.generic-card__meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #6a645c;
}

.generic-card__priority {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f4efe6;
  color: #1c1b1f;
  font-weight: 600;
}

.generic-card__priority[data-level='high'] {
  background: #ffe2c7;
  color: #6b2b00;
}

.generic-card__priority[data-level='medium'] {
  background: #fff4da;
  color: #7a5500;
}

.generic-card__priority[data-level='low'] {
  background: #e1f2e3;
  color: #1a5c2c;
}

.generic-card__owner {
  font-weight: 600;
}

.generic-card__title {
  margin: 0;
  font-size: 0.95rem;
}

.generic-card__description {
  margin: 0;
  font-size: 0.85rem;
  color: #4b4b4b;
}

.generic-empty {
  display: grid;
  gap: 4px;
  font-size: 0.9rem;
  color: #6a645c;
}
</style>
