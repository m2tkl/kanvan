import type { KanbanColumn } from '../../../../lib/types'
import { createTaskBoard } from './taskBoard'

export const createCampaignBoard = (): KanbanColumn[] => [
  {
    id: 'planning',
    title: 'Planning',
    items: [
      {
        id: 'camp-1',
        title: 'Define campaign goals',
        description: 'Q2 acquisition',
        channel: 'Brand',
        tags: ['strategy'],
      },
      {
        id: 'camp-2',
        title: 'Select channels',
        description: 'Paid + organic mix',
        channel: 'Acquisition',
        tags: ['budget', 'targeting'],
      },
    ],
  },
  {
    id: 'production',
    title: 'Production',
    items: [
      {
        id: 'camp-3',
        title: 'Draft landing page',
        description: 'Hero + CTA',
        channel: 'Web',
        tags: ['copy', 'design'],
      },
      {
        id: 'camp-4',
        title: 'Design ad set',
        description: '3 static, 1 video',
        channel: 'Paid Social',
        tags: ['creative'],
      },
    ],
  },
  {
    id: 'launch',
    title: 'Launch',
    items: [
      {
        id: 'camp-5',
        title: 'Schedule rollout',
        description: 'Stagger by region',
        channel: 'Lifecycle',
        tags: ['email', 'social'],
      },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    items: [
      {
        id: 'camp-6',
        title: 'Collect performance notes',
        channel: 'Analytics',
        tags: ['reporting'],
      },
    ],
  },
]
