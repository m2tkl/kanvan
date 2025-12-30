import type { KanbanColumn } from '../../../../lib/types'

export const createTaskBoard = (): KanbanColumn[] => [
  {
    id: 'backlog',
    title: 'Backlog',
    items: [
      {
        id: 'task-1',
        title: 'Design drag-and-drop flow',
        tags: ['ux', 'interaction'],
        owner: 'Lina',
      },
      {
        id: 'task-2',
        title: 'Update onboarding checklist',
        description: 'Align with QA',
        tags: ['ops'],
        owner: 'Chris',
      },
      {
        id: 'task-5',
        title: 'Clean up backlog tags',
        description: 'Archive stale items',
        tags: ['maintenance'],
        owner: 'Jules',
      },
      {
        id: 'task-6',
        title: 'Fix navigation spacing',
        description: 'Audit header layout',
        tags: ['ui'],
        owner: 'Riya',
      },
      {
        id: 'task-7',
        title: 'Schedule stakeholder sync',
        tags: ['meeting'],
        owner: 'Avery',
      },
      {
        id: 'task-8',
        title: 'Prepare weekly status',
        description: 'Send by Friday',
        tags: ['reporting'],
        owner: 'Noah',
      },
    ],
  },
  {
    id: 'progress',
    title: 'In Progress',
    items: [
      {
        id: 'task-3',
        title: 'QA regression pass',
        description: 'Focus on navigation',
        tags: ['qa'],
        owner: 'Mina',
      },
      {
        id: 'task-9',
        title: 'Draft handoff notes',
        description: 'Share with support',
        tags: ['handoff'],
        owner: 'Leo',
      },
      {
        id: 'task-10',
        title: 'Close open loops',
        description: 'Confirm acceptance',
        tags: ['follow-up'],
        owner: 'Zoe',
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    items: [
      {
        id: 'task-4',
        title: 'Initial design direction',
        tags: ['design'],
        owner: 'Kai',
      },
      {
        id: 'task-11',
        title: 'Publish release notes',
        description: 'Tag v1.2',
        tags: ['release'],
        owner: 'Evan',
      },
      {
        id: 'task-12',
        title: 'Archive completed tasks',
        tags: ['cleanup'],
        owner: 'Tara',
      },
    ],
  },
]
