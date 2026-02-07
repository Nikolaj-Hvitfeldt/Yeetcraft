import { useQuery } from '@tanstack/react-query'
import { fetchLeaderboard } from '../api/api'

export type LeaderboardBy = 'player' | 'character'

/**
 * Fetches leaderboard from API (by player or by character).
 * Use leaderboardQuery.data ?? fallback in the page when API is unavailable.
 */
export function useLeaderboard(by: LeaderboardBy) {
  return useQuery({
    queryKey: ['leaderboard', by],
    queryFn: async () => {
      const res = await fetchLeaderboard(by)
      return res.rows
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}
