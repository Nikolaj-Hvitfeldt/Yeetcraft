import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { fetchSetStatsBatch } from '../api/api'
import { SetStatsBatchRequestSchema } from '../api/schemas'
import type { PlayerStatsResponse, StatRow } from '../api/types'

export type SetPlayerStatsBatchRequest = z.infer<typeof SetStatsBatchRequestSchema>

type PlayerStatsQueryKey = ['player-stats', string, string]

type MutationContext = {
  previousPlayerStats: PlayerStatsResponse | undefined
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

      await queryClient.cancelQueries({ queryKey })

      const previousPlayerStats = queryClient.getQueryData<PlayerStatsResponse>(queryKey)

      if (previousPlayerStats) {
        queryClient.setQueryData<PlayerStatsResponse>(
          queryKey,
          applyDungeonUpdates(previousPlayerStats, request.stats),
        )
      }

      return { previousPlayerStats } satisfies MutationContext
    },
    onError: (_error, request, context) => {
      if (!context?.previousPlayerStats) return

      queryClient.setQueryData(
        ['player-stats', request.playerId, request.seasonId],
        context.previousPlayerStats,
      )
    },
    onSettled: (_data, _error, request) => {
      void queryClient.invalidateQueries({ queryKey: ['player-stats', request.playerId, request.seasonId] })
      void queryClient.invalidateQueries({ queryKey: ['season-leaders', request.seasonId] })
      void queryClient.invalidateQueries({ queryKey: ['season-dungeons', request.seasonId] })
      void queryClient.invalidateQueries({ queryKey: ['dungeon-leaderboard', request.seasonId] })
    },
  })
}
