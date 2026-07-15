import type { QueryClient } from '@tanstack/react-query'
import type { SetPlayerStatsBatchRequest } from './types'
import { queryKeys } from '../query-keys'

export async function invalidateSetPlayerStatsQueries(
  queryClient: QueryClient,
  request: Pick<SetPlayerStatsBatchRequest, 'playerId' | 'seasonId' | 'stats'>,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.playerStats(request.playerId, request.seasonId),
  })
  await queryClient.invalidateQueries({ queryKey: queryKeys.playerStatsBySlugRoot() })
  await queryClient.invalidateQueries({
    queryKey: queryKeys.seasonLeaders(request.seasonId),
  })
  await queryClient.invalidateQueries({
    queryKey: queryKeys.seasonDungeons(request.seasonId),
  })

  for (const update of request.stats) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.dungeonLeaderboard(request.seasonId, update.dungeonId),
    })
  }
}
