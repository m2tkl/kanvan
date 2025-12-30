<script setup lang="ts">
import { computed } from 'vue'
import { KanbanBoard } from '../../../../lib'
import type { KanbanColumn } from '../../../../lib/types'
import type { WorkItemMeta } from '../fixtures/softwareBoard'

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
      <div class="software-header">
        <div>
          <h2 class="software-header__title">{{ column.title }}</h2>
        </div>
        <span class="software-header__count">{{ column.items.length }}</span>
      </div>
    </template>
    <template #card="{ item }">
      <article class="software-card">
        <div class="software-card__meta">
          <span class="software-card__priority" :data-level="item.priority">
            {{ item.priority }}
          </span>
          <span class="software-card__owner">{{ item.owner }}</span>
        </div>
        <h3 class="software-card__title">{{ item.title }}</h3>
        <p v-if="item.description" class="software-card__description">
          {{ item.description }}
        </p>
        <span v-if="item.area" class="software-card__area">{{ item.area }}</span>
      </article>
    </template>
    <template #empty-column="{ column }">
      <div class="software-empty">
        <strong>{{ column.title }}</strong>
        <span>Drop a work item here.</span>
      </div>
    </template>
  </KanbanBoard>
</template>

<style scoped>
.software-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.software-header__title {
  margin: 4px 0 0;
  font-size: 1.05rem;
}

.software-header__count {
  background: #0f172a;
  color: #e2e8f0;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
}

.software-card {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 14px;
  padding: 12px;
  display: grid;
  gap: 6px;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.25);
}

.software-card__meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(226, 232, 240, 0.7);
}

.software-card__priority {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.16);
  color: #e2e8f0;
  font-weight: 600;
}

.software-card__priority[data-level='high'] {
  background: #fecaca;
  color: #7f1d1d;
}

.software-card__priority[data-level='medium'] {
  background: #fde68a;
  color: #92400e;
}

.software-card__priority[data-level='low'] {
  background: #bbf7d0;
  color: #166534;
}

.software-card__owner {
  font-weight: 600;
}

.software-card__title {
  margin: 0;
  font-size: 0.95rem;
}

.software-card__description {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.75);
}

.software-card__area {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.software-empty {
  display: grid;
  gap: 4px;
  font-size: 0.9rem;
  color: #6a645c;
}
</style>
