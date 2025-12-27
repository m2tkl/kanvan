<script setup lang="ts">
import type { KanbanColumn } from '../types'

defineProps<{ columns: KanbanColumn[] }>()
</script>

<template>
  <section class="kanban" data-testid="kanban-board">
    <article v-for="column in columns" :key="column.id" class="kanban-column">
      <header class="kanban-column__header">
        <h2 class="kanban-column__title">{{ column.title }}</h2>
        <span class="kanban-column__count">{{ column.items.length }}</span>
      </header>
      <ol class="kanban-column__list">
        <li v-for="item in column.items" :key="item.id" class="kanban-card">
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
}

.kanban-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: inset 0 0 0 1px rgba(28, 27, 31, 0.08);
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
