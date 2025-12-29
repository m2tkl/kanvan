import { fireEvent, render, screen } from '@testing-library/vue'
import { nextTick } from 'vue'
import KanbanBoard from '../src/lib/components/KanbanBoard.vue'

const createColumns = () => [
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
]

const createDataTransfer = () => ({
  setData: vi.fn(),
  setDragImage: vi.fn(),
  effectAllowed: 'move',
  dropEffect: 'move',
})

const mockRect = (element: Element, { top, height }: { top: number; height: number }) => {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      top,
      height,
      bottom: top + height,
      left: 0,
      right: 100,
      width: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }),
  })
}

describe('KanbanBoard', () => {
  it('renders columns and cards', () => {
    render(KanbanBoard, { props: { columns: createColumns() } })

    expect(screen.getByText('Todo')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByText('Design')).toBeInTheDocument()
    expect(screen.getByText('API draft')).toBeInTheDocument()
  })

  it('moves a card below another within the same column', async () => {
    const columns = createColumns()
    const { emitted } = render(KanbanBoard, { props: { columns } })
    const source = screen.getByText('Research').closest('li')
    const target = screen.getByText('Design').closest('li')
    const list = screen
      .getByText('Todo')
      .closest('.kanban-column')
      ?.querySelector('.kanban-column__list')

    if (!source || !target || !list) {
      throw new Error('Missing drag-and-drop targets')
    }

    const first = screen.getByText('Research').closest('li')
    if (!first) {
      throw new Error('Missing drag-and-drop targets')
    }

    mockRect(first, { top: 0, height: 10 })
    mockRect(target, { top: 200, height: 10 })
    const dataTransfer = createDataTransfer()

    await fireEvent.dragStart(source, { dataTransfer })
    await fireEvent.dragOver(list, { dataTransfer, clientY: 205 })
    await fireEvent.drop(list, { dataTransfer, clientY: 205 })
    await nextTick()

    const updates = emitted()['update:modelValue']
    expect(updates).toBeTruthy()
    const latest = updates?.[updates.length - 1]?.[0]
    const todoColumn = latest?.find((column: { id: string }) => column.id === 'todo')
    expect(todoColumn.items.map((item: { id: string }) => item.id)).toEqual(['b', 'a'])
  })

  it('does not render a placeholder until a move is possible', async () => {
    const columns = createColumns()
    render(KanbanBoard, { props: { columns } })
    const source = screen.getByText('Research').closest('li')
    if (!source) {
      throw new Error('Missing drag-and-drop targets')
    }

    const dataTransfer = createDataTransfer()
    await fireEvent.dragStart(source, { dataTransfer })
    await nextTick()

    expect(document.querySelectorAll('.kanban-card--placeholder')).toHaveLength(0)

    await fireEvent.dragEnd(source, { dataTransfer })
    await nextTick()

    expect(document.querySelectorAll('.kanban-card--placeholder')).toHaveLength(0)
    expect(screen.getByText('Research')).toBeInTheDocument()
  })

  it('moves a card across columns', async () => {
    const columns = createColumns()
    const { emitted } = render(KanbanBoard, { props: { columns } })
    const source = screen.getByText('Research').closest('li')
    const target = screen.getByText('Initial setup').closest('li')

    if (!source || !target) {
      throw new Error('Missing drag-and-drop targets')
    }

    mockRect(target, { top: 0, height: 100 })
    const dataTransfer = createDataTransfer()

    await fireEvent.dragStart(source, { dataTransfer })
    await fireEvent.dragOver(target, { dataTransfer, clientY: 80 })
    await fireEvent.drop(target, { dataTransfer })
    await nextTick()

    const updates = emitted()['update:modelValue']
    expect(updates).toBeTruthy()
    const latest = updates?.[updates.length - 1]?.[0]
    const doneColumn = latest?.find((column: { id: string }) => column.id === 'done')
    expect(doneColumn.items.some((item: { id: string }) => item.id === 'a')).toBe(true)
  })
})
