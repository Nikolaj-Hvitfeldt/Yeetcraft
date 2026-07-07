import { useQueryClient } from '@tanstack/react-query'
import { fetchPlayerStats, fetchSeasonLeaders } from '../api/api'

export function usePrefetchPlayerProfile() {
  const queryClient = useQueryClient()

  return function prefetchPlayerProfile(playerId: string, seasonId?: string) {
    if (!seasonId) return

    void queryClient.prefetchQuery({
      queryKey: ['player-stats', playerId, seasonId],
      queryFn: () => fetchPlayerStats(playerId, seasonId),
      staleTime: 30_000,
    })

    void queryClient.prefetchQuery({
      queryKey: ['season-leaders', seasonId],
      queryFn: () => fetchSeasonLeaders(seasonId),
      staleTime: 30_000,
    })
  }
}
