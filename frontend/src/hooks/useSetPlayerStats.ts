import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSetStatsBatch } from '../api/api'
import type { PlayerStatsResponse, StatRow } from '../api/types'
import { invalidateSetPlayerStatsQueries } from '../lib/write-outbox/reconcile-queries'
import {
  removeWriteByDedupeKey,
  upsertSetPlayerStatsWrite,
} from '../lib/write-outbox/store'
import { syncOutbox } from '../lib/write-outbox/sync'
import {
  getSetPlayerStatsDedupeKey,
  type SetPlayerStatsBatchRequest,
} from '../lib/write-outbox/types'
import { isRetryableError } from '../utils/api-error'

export type { SetPlayerStatsBatchRequest }

type PlayerStatsQueryKey = ['player-stats', string, string]
type PlayerStatsBySlugQueryKey = ['player-stats-by-slug', string, string]

type MutationContext = {
  previousPlayerStats: PlayerStatsResponse | undefined
  previousSlugQueries: Array<{
    queryKey: PlayerStatsBySlugQueryKey
    data: PlayerStatsResponse
  }>
}

function applyDungeonUpdates(
  playerStats: PlayerStatsResponse,
  updates: SetPlayerStatsBatchRequest['stats'],
): PlayerStatsResponse {
  const updatesByDungeonId = new Map(updates.map((update) => [update.dungeonId, update]))

  const dungeons = playerStats.dungeons.map((row) => {
    const update = updatesByDungeonId.get(row.dungeon.id)
    if (!update) return row

    return {
      ...row,
      deaths: update.deaths,
      yeets: update.yeets,
      totalMistakes: update.deaths + update.yeets,
    }
  })

  const totalDeaths = dungeons.reduce((sum, row) => sum + row.deaths, 0)
  const totalYeets = dungeons.reduce((sum, row) => sum + row.yeets, 0)

  return {
    ...playerStats,
    dungeons,
    totalDeaths,
    totalYeets,
    totalMistakes: totalDeaths + totalYeets,
  }
}

export function useSetPlayerStats() {
  const queryClient = useQueryClient()

  return useMutation({
    scope: {
      id: 'set-player-stats',
    },
    mutationFn: async (request: SetPlayerStatsBatchRequest): Promise<StatRow[]> => {
      return fetchSetStatsBatch(request)
    },
    onMutate: async (request) => {
      const queryKey: PlayerStatsQueryKey = ['player-stats', request.playerId, request.seasonId]

      await queryClient.cancelQueries({ queryKey: ['player-stats'] })
      await queryClient.cancelQueries({ queryKey: ['player-stats-by-slug'] })

      const previousPlayerStats = queryClient.getQueryData<PlayerStatsResponse>(queryKey)
      const previousSlugQueries: MutationContext['previousSlugQueries'] = []

      if (previousPlayerStats) {
        queryClient.setQueryData<PlayerStatsResponse>(
          queryKey,
          applyDungeonUpdates(previousPlayerStats, request.stats),
        )
      }

      for (const [slugQueryKey, slugPlayerStats] of queryClient.getQueriesData<PlayerStatsResponse>({
        queryKey: ['player-stats-by-slug'],
      })) {
        if (!slugPlayerStats || slugPlayerStats.player.id !== request.playerId) continue

        previousSlugQueries.push({
          queryKey: slugQueryKey as PlayerStatsBySlugQueryKey,
          data: slugPlayerStats,
        })
        queryClient.setQueryData(
          slugQueryKey,
          applyDungeonUpdates(slugPlayerStats, request.stats),
        )
      }

      return { previousPlayerStats, previousSlugQueries } satisfies MutationContext
    },
    onSuccess: async (_data, request) => {
      await removeWriteByDedupeKey(getSetPlayerStatsDedupeKey(request))
    },
    onError: async (error, request, context) => {
      if (isRetryableError(error)) {
        await upsertSetPlayerStatsWrite(request)
        void syncOutbox(queryClient)
        return
      }

      if (context?.previousPlayerStats) {
        queryClient.setQueryData(
          ['player-stats', request.playerId, request.seasonId],
          context.previousPlayerStats,
        )
      }

      for (const { queryKey, data } of context?.previousSlugQueries ?? []) {
        queryClient.setQueryData(queryKey, data)
      }
    },
    onSettled: async (data, error, request) => {
      if (error && isRetryableError(error)) {
        return
      }

      if (data) {
        await invalidateSetPlayerStatsQueries(queryClient, request)
      }
    },
  })
}
