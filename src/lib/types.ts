export type KanbanItem = {
  id: string
  title: string
  description?: string
}

export type KanbanColumn = {
  id: string
  title: string
  items: KanbanItem[]
}
