import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { fetchSetStatsBatch } from '../api/api'
import { SetStatsBatchRequestSchema } from '../api/schemas'
import type { PlayerStatsResponse, StatRow } from '../api/types'

export type SetPlayerStatsBatchRequest = z.infer<typeof SetStatsBatchRequestSchema>

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
    onError: (_error, request, context) => {
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
    onSettled: (_data, _error, request) => {
      void queryClient.invalidateQueries({ queryKey: ['player-stats', request.playerId, request.seasonId] })
      void queryClient.invalidateQueries({ queryKey: ['player-stats-by-slug'] })
      void queryClient.invalidateQueries({ queryKey: ['season-leaders', request.seasonId] })
      void queryClient.invalidateQueries({ queryKey: ['season-dungeons', request.seasonId] })

      for (const update of request.stats) {
        void queryClient.invalidateQueries({
          queryKey: ['dungeon-leaderboard', request.seasonId, update.dungeonId],
        })
      }
    },
  })
}
