import { describe, expect, it } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import type { PlayerStatsResponse } from '../../api/types'
import { queryKeys } from '../query-keys'
import { applyPendingStatsWritesToQueryCache } from './apply-pending-to-cache'
import { __resetWriteOutboxStoreForTests } from './store'
import type { SetPlayerStatsWrite } from './types'

const playerStats: PlayerStatsResponse = {
  player: { id: 'p1', displayName: 'Alpha', avatarUrl: null },
  season: { id: 's1', name: 'Season 1', expansion: null, isCurrent: true },
  totalDeaths: 1,
  totalYeets: 2,
  totalMistakes: 3,
  dungeons: [
    {
      dungeon: {
        id: 'd1',
        name: 'Dungeon 1',
        shortName: null,
        displayOrder: 1,
        totalDeaths: 1,
        totalYeets: 2,
        totalMistakes: 3,
      },
      deaths: 1,
      yeets: 2,
      totalMistakes: 3,
    },
  ],
}

describe('applyPendingStatsWritesToQueryCache', () => {
  it('merges pending outbox stats into restored query cache', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(queryKeys.playerStats('p1', 's1'), playerStats)

    const pendingWrite: SetPlayerStatsWrite = {
      id: 'write-1',
      type: 'set-player-stats',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      attempts: 0,
      status: 'pending',
      authScope: 'token',
      dedupeKey: 'set-player-stats:p1:s1',
      payload: {
        playerId: 'p1',
        seasonId: 's1',
        stats: [{ dungeonId: 'd1', deaths: 4, yeets: 5 }],
      },
    }

    __resetWriteOutboxStoreForTests([pendingWrite])
    applyPendingStatsWritesToQueryCache(queryClient)

    const updated = queryClient.getQueryData<PlayerStatsResponse>(
      queryKeys.playerStats('p1', 's1'),
    )

    expect(updated?.dungeons[0]?.deaths).toBe(4)
    expect(updated?.dungeons[0]?.yeets).toBe(5)
    expect(updated?.totalMistakes).toBe(9)
  })

  it('ignores failed outbox writes', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(queryKeys.playerStats('p1', 's1'), playerStats)

    const failedWrite: SetPlayerStatsWrite = {
      id: 'write-1',
      type: 'set-player-stats',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      attempts: 1,
      status: 'failed',
      lastError: 'Bad request',
      authScope: 'token',
      dedupeKey: 'set-player-stats:p1:s1',
      payload: {
        playerId: 'p1',
        seasonId: 's1',
        stats: [{ dungeonId: 'd1', deaths: 9, yeets: 9 }],
      },
    }

    __resetWriteOutboxStoreForTests([failedWrite])
    applyPendingStatsWritesToQueryCache(queryClient)

    const unchanged = queryClient.getQueryData<PlayerStatsResponse>(
      queryKeys.playerStats('p1', 's1'),
    )

    expect(unchanged?.dungeons[0]?.deaths).toBe(1)
  })
})
