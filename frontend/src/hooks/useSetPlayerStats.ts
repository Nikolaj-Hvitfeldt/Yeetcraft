import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSetStats } from '../api/api'
import type { StatRow } from '../api/types'

export type SetPlayerStatsRequest = {
  playerId: string
  seasonId: string
  dungeonId: string
  deaths: number
  yeets: number
}

export function useSetPlayerStats() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (request: SetPlayerStatsRequest): Promise<StatRow> => {
      return fetchSetStats(request)
    },
  })

  function invalidatePlayerProfileQueries(playerId: string, seasonId: string) {
    void queryClient.invalidateQueries({ queryKey: ['player-stats', playerId, seasonId] })
    void queryClient.invalidateQueries({ queryKey: ['leaderboard', seasonId] })
    void queryClient.invalidateQueries({ queryKey: ['season-leaders', seasonId] })
  }

  return { ...mutation, invalidatePlayerProfileQueries }
}

