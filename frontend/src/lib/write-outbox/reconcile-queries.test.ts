import { describe, expect, it, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { invalidateSetPlayerStatsQueries } from './reconcile-queries'
import { queryKeys } from '../query-keys'

describe('invalidateSetPlayerStatsQueries', () => {
  it('invalidates all affected query keys', async () => {
    const queryClient = new QueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()

    await invalidateSetPlayerStatsQueries(queryClient, {
      playerId: 'p1',
      seasonId: 's1',
      stats: [
        { dungeonId: 'd1', deaths: 1, yeets: 2 },
        { dungeonId: 'd2', deaths: 3, yeets: 4 },
      ],
    })

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.playerStats('p1', 's1'),
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.playerStatsBySlugRoot() })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.seasonLeaders('s1') })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.seasonDungeons('s1') })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.dungeonLeaderboard('s1', 'd1'),
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.dungeonLeaderboard('s1', 'd2'),
    })
  })
})
