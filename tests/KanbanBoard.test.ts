import { render, screen } from '@testing-library/vue'
import KanbanBoard from '../src/lib/components/KanbanBoard.vue'

const columns = [
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

describe('KanbanBoard', () => {
  it('renders columns and cards', () => {
    render(KanbanBoard, { props: { columns } })

    expect(screen.getByText('Todo')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByText('Design')).toBeInTheDocument()
    expect(screen.getByText('API draft')).toBeInTheDocument()
  })
})
