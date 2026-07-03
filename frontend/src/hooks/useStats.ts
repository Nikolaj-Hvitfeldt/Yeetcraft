import { useQuery } from '@tanstack/react-query'
import { fetchCurrentSeasonDungeons, fetchLeaderboard, fetchPlayerStats, fetchSeasons } from '../api/api'
import { LeaderboardEntry } from '../api/types'

export type FilterTab = 'all' | 'death' | 'yeet'

export interface PlayerStats {
  playerId: string
  playerName: string
  avatarUrl: string | null
  total: number
  deaths: number
  yeets: number
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await fetchLeaderboard()
      return response.leaderboard
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}

export function usePlayerStats(playerId: string | undefined, seasonId?: string) {
  return useQuery({
    queryKey: ['player-stats', playerId, seasonId ?? 'current'],
    queryFn: () => {
      if (!playerId) throw new Error('Missing player id')
      return fetchPlayerStats(playerId, seasonId)
    },
    enabled: !!playerId,
    staleTime: 30_000,
  })
}

export function useSeasons() {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: async () => {
      const response = await fetchSeasons()
      return response.seasons
    },
    staleTime: 60_000,
  })
}

export function useCurrentSeasonDungeons() {
  return useQuery({
    queryKey: ['current-season-dungeons'],
    queryFn: async () => {
      const response = await fetchCurrentSeasonDungeons()
      return response.dungeons
    },
    staleTime: 60_000,
  })
}

export function deriveLeaderboard(entries: LeaderboardEntry[], filter: FilterTab): PlayerStats[] {
  const leaderboard = entries.map((entry) => ({
    playerId: entry.playerId,
    playerName: entry.displayName,
    avatarUrl: entry.avatarUrl,
    total: getFilteredTotal(entry, filter),
    deaths: entry.totalDeaths,
    yeets: entry.totalYeets,
  }))

  return leaderboard
    .filter((entry) => filter === 'all' || entry.total > 0)
    .sort((firstEntry, secondEntry) => {
      if (secondEntry.total !== firstEntry.total) return secondEntry.total - firstEntry.total
      return secondEntry.yeets - firstEntry.yeets
    })
}

export function calculateTotalStats(entries: LeaderboardEntry[]) {
  return entries.reduce(
    (totals, entry) => ({
      total: totals.total + entry.totalMistakes,
      deaths: totals.deaths + entry.totalDeaths,
      yeets: totals.yeets + entry.totalYeets,
    }),
    { total: 0, deaths: 0, yeets: 0 }
  )
}

function getFilteredTotal(entry: LeaderboardEntry, filter: FilterTab): number {
  if (filter === 'death') return entry.totalDeaths
  if (filter === 'yeet') return entry.totalYeets
  return entry.totalMistakes
}
