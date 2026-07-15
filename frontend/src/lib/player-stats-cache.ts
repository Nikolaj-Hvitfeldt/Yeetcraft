import type { QueryClient } from '@tanstack/react-query'
import type { PlayerStatsResponse } from '../api/types'
import type { SetPlayerStatsBatchRequest } from './write-outbox/types'
import { queryKeys } from './query-keys'

export function applyDungeonUpdates(
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

type PlayerStatsBySlugQueryKey = ReturnType<typeof queryKeys.playerStatsBySlug>

export type PlayerStatsOptimisticContext = {
  previousPlayerStats: PlayerStatsResponse | undefined
  previousSlugQueries: Array<{
    queryKey: PlayerStatsBySlugQueryKey
    data: PlayerStatsResponse
  }>
}

export async function applyPlayerStatsUpdatesToCache(
  queryClient: QueryClient,
  request: SetPlayerStatsBatchRequest,
): Promise<PlayerStatsOptimisticContext> {
  const queryKey = queryKeys.playerStats(request.playerId, request.seasonId)

  await queryClient.cancelQueries({ queryKey: queryKeys.playerStatsRoot() })
  await queryClient.cancelQueries({ queryKey: queryKeys.playerStatsBySlugRoot() })

  const previousPlayerStats = queryClient.getQueryData<PlayerStatsResponse>(queryKey)
  const previousSlugQueries: PlayerStatsOptimisticContext['previousSlugQueries'] = []

  if (previousPlayerStats) {
    queryClient.setQueryData<PlayerStatsResponse>(
      queryKey,
      applyDungeonUpdates(previousPlayerStats, request.stats),
    )
  }

  for (const [slugQueryKey, slugPlayerStats] of queryClient.getQueriesData<PlayerStatsResponse>({
    queryKey: queryKeys.playerStatsBySlugRoot(),
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

  return { previousPlayerStats, previousSlugQueries }
}

export function rollbackPlayerStatsUpdates(
  queryClient: QueryClient,
  request: Pick<SetPlayerStatsBatchRequest, 'playerId' | 'seasonId'>,
  context: PlayerStatsOptimisticContext,
): void {
  if (context.previousPlayerStats) {
    queryClient.setQueryData(
      queryKeys.playerStats(request.playerId, request.seasonId),
      context.previousPlayerStats,
    )
  }

  for (const { queryKey, data } of context.previousSlugQueries) {
    queryClient.setQueryData(queryKey, data)
  }
}
