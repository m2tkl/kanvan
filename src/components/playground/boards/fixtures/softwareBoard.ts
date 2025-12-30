import type { KanbanColumn } from '../../../../lib/types'

export type WorkItemMeta = {
  priority: 'low' | 'medium' | 'high'
  owner: string
  area?: string
}

export const createSoftwareBoard = (): KanbanColumn<WorkItemMeta>[] => [
  {
    id: 'triage',
    title: 'Triage',
    items: [
      {
        id: 'g-1',
        title: 'Confirm bug report',
        description: 'Reproduce on staging',
        priority: 'high',
        owner: 'Casey',
        area: 'Auth',
      },
      {
        id: 'g-2',
        title: 'Estimate API change',
        description: 'Check data impact',
        priority: 'medium',
        owner: 'Jordan',
        area: 'Billing',
      },
    ],
  },
  {
    id: 'build',
    title: 'Build',
    items: [
      {
        id: 'g-3',
        title: 'Implement retry logic',
        description: 'Backoff + jitter',
        priority: 'low',
        owner: 'Morgan',
        area: 'Infra',
      },
    ],
  },
  {
    id: 'ship',
    title: 'Ship',
    items: [
      {
        id: 'g-4',
        title: 'Prepare release notes',
        description: 'Include breaking changes',
        priority: 'medium',
        owner: 'Taylor',
        area: 'Release',
      },
    ],
  },
  {
    id: 'validate',
    title: 'Validate',
    items: [
      {
        id: 'g-5',
        title: 'Monitor error rates',
        description: 'Check dashboards',
        priority: 'high',
        owner: 'Riley',
        area: 'Observability',
      },
    ],
  },
]
