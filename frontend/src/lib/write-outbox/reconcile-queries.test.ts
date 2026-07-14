import { describe, expect, it, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { invalidateSetPlayerStatsQueries } from './reconcile-queries'

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
      queryKey: ['player-stats', 'p1', 's1'],
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['player-stats-by-slug'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['season-leaders', 's1'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['season-dungeons', 's1'] })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['dungeon-leaderboard', 's1', 'd1'],
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['dungeon-leaderboard', 's1', 'd2'],
    })
  })
})
