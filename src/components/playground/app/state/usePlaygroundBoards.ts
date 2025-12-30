import { ref } from 'vue'
import type { KanbanColumn } from '../../../../lib/types'
import { createCampaignBoard } from '../../boards/fixtures/campaignBoard'
import { createSoftwareBoard } from '../../boards/fixtures/softwareBoard'
import { createTaskBoard } from '../../boards/fixtures/taskBoard'
import { createProjectBoard } from '../../boards/fixtures/projectBoard'

export type PlaygroundViewId = 'task' | 'campaign' | 'software' | 'project'

export const usePlaygroundBoards = () => ({
  task: ref<KanbanColumn[]>(createTaskBoard()),
  campaign: ref<KanbanColumn[]>(createCampaignBoard()),
  software: ref<KanbanColumn[]>(createSoftwareBoard()),
  project: ref<KanbanColumn[]>(createProjectBoard()),
})
