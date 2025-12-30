import type { KanbanColumn } from '../../../../lib/types'

export const createProjectBoard = (): KanbanColumn[] => [
  {
    id: 'intake',
    title: 'Intake',
    items: [
      {
        id: 'req-1',
        title: 'Capture onboarding needs',
        description: 'Interview sales',
        labels: ['customer'],
        owners: ['CT'],
      },
      {
        id: 'req-2',
        title: 'List compliance constraints',
        description: 'Review SOC2',
        labels: ['risk', 'legal'],
        owners: ['JR'],
      },
    ],
  },
  {
    id: 'analysis',
    title: 'Analysis',
    items: [
      {
        id: 'req-3',
        title: 'Define success criteria',
        description: 'KPIs + metrics',
        labels: ['metrics'],
        owners: ['AL'],
      },
    ],
  },
  {
    id: 'prioritized',
    title: 'Prioritized',
    items: [
      {
        id: 'req-4',
        title: 'Rank must-haves',
        description: 'MoSCoW',
        labels: ['scope'],
        owners: ['KT'],
      },
    ],
  },
  {
    id: 'approved',
    title: 'Approved',
    items: [
      {
        id: 'req-5',
        title: 'Sign-off round',
        description: 'Stakeholder review',
        labels: ['approval'],
        owners: ['MS'],
      },
    ],
  },
  {
    id: 'baselined',
    title: 'Baselined',
    items: [
      {
        id: 'req-6',
        title: 'Freeze requirement set',
        labels: ['baseline'],
        owners: ['PM'],
      },
    ],
  },
]
