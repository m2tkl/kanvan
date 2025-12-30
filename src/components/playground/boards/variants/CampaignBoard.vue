<script setup lang="ts">
import { computed } from 'vue'
import { KanbanBoard } from '../../../../lib'
import type { KanbanColumn, KanbanItem } from '../../../../lib/types'

type CampaignMeta = {
  tags?: string[]
  channel?: string
}

type CampaignItem = KanbanItem<CampaignMeta>

const props = defineProps<{
  modelValue: KanbanColumn<CampaignMeta>[]
  debug?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: KanbanColumn<CampaignMeta>[]): void
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
  set: (value: KanbanColumn<CampaignMeta>[]) => emit('update:modelValue', value),
})

const getTags = (item: unknown) => (item as CampaignItem).tags ?? []
const getChannel = (item: unknown) => (item as CampaignItem).channel ?? ''
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
      <div class="campaign-header">
        <div>
          <h2 class="campaign-header__title">{{ column.title }}</h2>
        </div>
        <span class="campaign-header__badge">{{ column.items.length }}</span>
      </div>
    </template>
    <template #card="{ item }">
      <article class="campaign-card">
        <div class="campaign-card__top">
          <span v-if="getChannel(item)" class="campaign-card__channel">
            {{ getChannel(item) }}
          </span>
          <span class="campaign-card__id">#{{ item.id }}</span>
        </div>
        <h3 class="campaign-card__title">{{ item.title }}</h3>
        <p v-if="item.description" class="campaign-card__description">
          {{ item.description }}
        </p>
        <div v-if="getTags(item).length" class="campaign-card__tags">
          <span v-for="tag in getTags(item)" :key="tag" class="campaign-card__tag">
            {{ tag }}
          </span>
        </div>
      </article>
    </template>
    <template #empty-column="{ column }">
      <div class="campaign-empty">
        <strong>{{ column.title }}</strong>
        <span>No cards yet. Drag one here.</span>
      </div>
    </template>
    <template #column-footer="{ column }">
      <button class="campaign-footer" type="button">
        Add card to {{ column.title }}
      </button>
    </template>
  </KanbanBoard>
</template>

<style scoped>
.campaign-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.campaign-header__title {
  margin: 4px 0 0;
  font-size: 1.05rem;
}

.campaign-header__badge {
  background: #1f2937;
  color: #fef3c7;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
}

.campaign-card {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 14px;
  padding: 10px 12px;
  height: 100%;
  display: grid;
  gap: 6px;
}

.campaign-card__top {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(226, 232, 240, 0.7);
}

.campaign-card__channel {
  background: rgba(226, 232, 240, 0.14);
  padding: 2px 8px;
  border-radius: 999px;
}

.campaign-card__id {
  font-size: 0.7rem;
}

.campaign-card__title {
  margin: 0;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.campaign-card__description {
  margin: 0;
  font-size: 0.78rem;
  color: rgba(226, 232, 240, 0.75);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.campaign-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.campaign-card__tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.16);
  color: #e2e8f0;
  font-weight: 600;
}

.campaign-empty {
  display: grid;
  gap: 4px;
  font-size: 0.9rem;
}

.campaign-footer {
  width: 100%;
  border: 1px dashed rgba(28, 27, 31, 0.3);
  background: #0f172a;
  color: #e2e8f0;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}
</style>
