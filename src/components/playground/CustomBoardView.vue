<script setup lang="ts">
import { computed } from 'vue'
import { KanbanBoard } from '../../lib'
import type { KanbanColumn } from '../../lib/types'

const props = defineProps<{
  modelValue: KanbanColumn[]
  debug?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: KanbanColumn[]): void
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
  set: (value: KanbanColumn[]) => emit('update:modelValue', value),
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
      <div class="custom-header">
        <div>
          <p class="custom-header__eyebrow">Stage</p>
          <h2 class="custom-header__title">{{ column.title }}</h2>
        </div>
        <span class="custom-header__badge">{{ column.items.length }}</span>
      </div>
    </template>
    <template #card="{ item, column }">
      <article class="custom-card">
        <div class="custom-card__top">
          <span class="custom-card__pill">{{ column.title }}</span>
          <span class="custom-card__id">#{{ item.id }}</span>
        </div>
        <h3 class="custom-card__title">{{ item.title }}</h3>
        <p v-if="item.description" class="custom-card__description">
          {{ item.description }}
        </p>
      </article>
    </template>
    <template #empty-column="{ column }">
      <div class="custom-empty">
        <strong>{{ column.title }}</strong>
        <span>No cards yet. Drag one here.</span>
      </div>
    </template>
    <template #column-footer="{ column }">
      <button class="custom-footer" type="button">
        Add card to {{ column.title }}
      </button>
    </template>
  </KanbanBoard>
</template>

<style scoped>
.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.custom-header__eyebrow {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #6a645c;
}

.custom-header__title {
  margin: 4px 0 0;
  font-size: 1.05rem;
}

.custom-header__badge {
  background: #1c1b1f;
  color: #fff4da;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
}

.custom-card {
  background: #1c1b1f;
  color: #fff4da;
  border-radius: 14px;
  padding: 10px 12px;
  height: 100%;
  display: grid;
  gap: 4px;
}

.custom-card__top {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 244, 218, 0.7);
}

.custom-card__pill {
  background: rgba(255, 244, 218, 0.16);
  padding: 2px 8px;
  border-radius: 999px;
}

.custom-card__id {
  font-size: 0.7rem;
}

.custom-card__title {
  margin: 0;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.custom-card__description {
  margin: 0;
  font-size: 0.78rem;
  color: rgba(255, 244, 218, 0.75);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.custom-empty {
  display: grid;
  gap: 4px;
  font-size: 0.9rem;
}

.custom-footer {
  width: 100%;
  border: 1px dashed rgba(28, 27, 31, 0.3);
  background: transparent;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}
</style>
