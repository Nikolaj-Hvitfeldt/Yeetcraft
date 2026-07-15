import type { QueryClient } from '@tanstack/react-query'
import type { PlayerStatsResponse } from '../../api/types'
import { applyDungeonUpdates } from '../player-stats-cache'
import { queryKeys } from '../query-keys'
import { getOutboxWrites } from './store'

export function applyPendingStatsWritesToQueryCache(queryClient: QueryClient): void {
  const pendingWrites = getOutboxWrites().filter(
    (write) =>
      write.type === 'set-player-stats' &&
      (write.status === 'pending' || write.status === 'syncing'),
  )

  for (const write of pendingWrites) {
    if (write.type !== 'set-player-stats') continue

    const { playerId, seasonId, stats } = write.payload
    const queryKey = queryKeys.playerStats(playerId, seasonId)
    const existing = queryClient.getQueryData<PlayerStatsResponse>(queryKey)

    if (existing) {
      queryClient.setQueryData(queryKey, applyDungeonUpdates(existing, stats))
    }

    for (const [slugQueryKey, slugPlayerStats] of queryClient.getQueriesData<PlayerStatsResponse>({
      queryKey: queryKeys.playerStatsBySlugRoot(),
    })) {
      if (!slugPlayerStats || slugPlayerStats.player.id !== playerId) continue

      queryClient.setQueryData(
        slugQueryKey,
        applyDungeonUpdates(slugPlayerStats, stats),
      )
    }
  }
}
