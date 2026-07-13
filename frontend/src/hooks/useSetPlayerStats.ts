import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSetStatsBatch } from '../api/api'
import type { PlayerStatsResponse, StatRow } from '../api/types'

export type SetStatsBatchDungeonUpdate = {
  dungeonId: string
  deaths: number
  yeets: number
}

export type SetPlayerStatsBatchRequest = {
  playerId: string
  seasonId: string
  stats: SetStatsBatchDungeonUpdate[]
}

type PlayerStatsQueryKey = ['player-stats', string, string]

type MutationContext = {
  previousPlayerStats: PlayerStatsResponse | undefined
}

function applyDungeonUpdates(
  playerStats: PlayerStatsResponse,
  updates: SetStatsBatchDungeonUpdate[],
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

  const mutation = useMutation({
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
      invalidatePlayerProfileQueries(request.playerId, request.seasonId)
    },
  })

  function invalidatePlayerProfileQueries(playerId: string, seasonId: string) {
    void queryClient.invalidateQueries({ queryKey: ['player-stats', playerId, seasonId] })
    void queryClient.invalidateQueries({ queryKey: ['leaderboard', seasonId] })
    void queryClient.invalidateQueries({ queryKey: ['season-leaders', seasonId] })
  }

  return { ...mutation, invalidatePlayerProfileQueries }
}
