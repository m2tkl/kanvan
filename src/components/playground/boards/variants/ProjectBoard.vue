<script setup lang="ts">
import { computed } from 'vue'
import { KanbanBoard } from '../../../../lib'
import type { KanbanColumn, KanbanItem } from '../../../../lib/types'

type ProjectMeta = {
  labels?: string[]
  owners?: string[]
}

type ProjectItem = KanbanItem<ProjectMeta>

const props = defineProps<{
  modelValue: KanbanColumn<ProjectMeta>[]
  debug?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: KanbanColumn<ProjectMeta>[]): void
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
  set: (value: KanbanColumn<ProjectMeta>[]) => emit('update:modelValue', value),
})

const getLabels = (item: unknown) => (item as ProjectItem).labels ?? []
const getOwners = (item: unknown) => (item as ProjectItem).owners ?? []
const toLabelKey = (label: string) => label.toLowerCase().replace(/\s+/g, '-')
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
      <div class="project-header">
        <div class="project-header__meta">
          <span class="project-header__dot"></span>
          <h2 class="project-header__title">{{ column.title }}</h2>
        </div>
        <span class="project-header__count">{{ column.items.length }}</span>
      </div>
    </template>
    <template #card="{ item }">
      <article class="project-card">
        <div v-if="getLabels(item).length" class="project-card__labels">
          <span
            v-for="label in getLabels(item)"
            :key="label"
            class="project-card__label project-card__label--gray"
            :data-kind="toLabelKey(label)"
          >
            {{ label }}
          </span>
        </div>
        <h3 class="project-card__title">{{ item.title }}</h3>
        <p v-if="item.description" class="project-card__description">
          {{ item.description }}
        </p>
        <div class="project-card__footer">
          <span class="project-card__badge">#{{ item.id }}</span>
          <div v-if="getOwners(item).length" class="project-card__avatars">
            <span v-for="owner in getOwners(item)" :key="owner" class="project-card__avatar">
              {{ owner }}
            </span>
          </div>
        </div>
      </article>
    </template>
    <template #empty-column="{ column }">
      <div class="project-empty">
        <strong>{{ column.title }}</strong>
        <span>Drag an issue here</span>
      </div>
    </template>
  </KanbanBoard>
</template>

<style scoped>
.project-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.project-header__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-header__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #0f766e;
}

.project-header__title {
  margin: 0;
  font-size: 1rem;
}

.project-header__count {
  background: #f0fdfa;
  color: #0f766e;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  box-shadow: inset 0 0 0 1px rgba(28, 27, 31, 0.12);
}

.project-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 8px;
  box-shadow: inset 0 0 0 1px rgba(28, 27, 31, 0.08);
  border-left: 4px solid #0f766e;
}

.project-card__labels {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.project-card__label {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}

.project-card__label--gray {
  background: #e7e5e4;
  color: #57534e;
}

.project-card__label[data-kind='customer'] {
  background: #e0f2fe;
  color: #0369a1;
}

.project-card__label[data-kind='risk'] {
  background: #fee2e2;
  color: #b91c1c;
}

.project-card__label[data-kind='legal'] {
  background: #ede9fe;
  color: #6d28d9;
}

.project-card__label[data-kind='metrics'] {
  background: #fef3c7;
  color: #92400e;
}

.project-card__label[data-kind='scope'] {
  background: #ecfccb;
  color: #3f6212;
}

.project-card__label[data-kind='approval'] {
  background: #fce7f3;
  color: #be185d;
}

.project-card__label[data-kind='baseline'] {
  background: #e2e8f0;
  color: #334155;
}

.project-card__title {
  margin: 0;
  font-size: 0.95rem;
}

.project-card__description {
  margin: 0;
  font-size: 0.85rem;
  color: #4b4b4b;
}

.project-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.75rem;
  color: #6a645c;
}

.project-card__badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f4f1eb;
}

.project-card__avatars {
  display: flex;
  gap: 4px;
}

.project-card__avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #1c1b1f;
  color: #fff4da;
  display: grid;
  place-items: center;
  font-size: 0.6rem;
  font-weight: 600;
}

.project-empty {
  display: grid;
  gap: 4px;
  font-size: 0.9rem;
  color: #6a645c;
}
</style>
