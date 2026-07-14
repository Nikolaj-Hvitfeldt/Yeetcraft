import type { QueryClient } from '@tanstack/react-query'
import type { SetPlayerStatsBatchRequest } from './types'

export async function invalidateSetPlayerStatsQueries(
  queryClient: QueryClient,
  request: Pick<SetPlayerStatsBatchRequest, 'playerId' | 'seasonId' | 'stats'>,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: ['player-stats', request.playerId, request.seasonId],
  })
  await queryClient.invalidateQueries({ queryKey: ['player-stats-by-slug'] })
  await queryClient.invalidateQueries({ queryKey: ['season-leaders', request.seasonId] })
  await queryClient.invalidateQueries({ queryKey: ['season-dungeons', request.seasonId] })

  for (const update of request.stats) {
    await queryClient.invalidateQueries({
      queryKey: ['dungeon-leaderboard', request.seasonId, update.dungeonId],
    })
  }
}
