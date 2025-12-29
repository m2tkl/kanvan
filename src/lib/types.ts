export type KanbanItem<Extra extends Record<string, unknown> = Record<string, unknown>> = {
  id: string
  title: string
  description?: string
} & Extra

export type KanbanColumn<
  Extra extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: string
  title: string
  items: KanbanItem<Extra>[]
}
