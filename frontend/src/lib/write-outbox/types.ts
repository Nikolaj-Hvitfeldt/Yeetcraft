import { z } from 'zod'
import { SetStatsBatchRequestSchema } from '../../api/schemas'

export type SetPlayerStatsBatchRequest = z.infer<typeof SetStatsBatchRequestSchema>

export type WriteStatus = 'pending' | 'syncing' | 'failed'

export type WriteType = 'set-player-stats'

type PendingWriteBase = {
  id: string
  createdAt: string
  updatedAt: string
  attempts: number
  status: WriteStatus
  lastError?: string
  authScope: string | null
  dedupeKey: string
}

export type SetPlayerStatsWrite = PendingWriteBase & {
  type: 'set-player-stats'
  payload: SetPlayerStatsBatchRequest
}

export type PendingWrite = SetPlayerStatsWrite

export type OutboxSnapshot = {
  version: 1
  writes: PendingWrite[]
}

export function buildSetPlayerStatsDedupeKey(playerId: string, seasonId: string): string {
  return `set-player-stats:${playerId}:${seasonId}`
}

export function getSetPlayerStatsDedupeKey(payload: SetPlayerStatsBatchRequest): string {
  return buildSetPlayerStatsDedupeKey(payload.playerId, payload.seasonId)
}
