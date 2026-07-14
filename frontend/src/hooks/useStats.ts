import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  fetchCurrentSeasonDungeons,
  fetchDungeonLeaderboard,
  fetchPlayerStats,
  fetchPlayerStatsBySlug,
  fetchSeasonLeaders,
  fetchSeasons,
} from '../api/api'
import { LeaderboardEntry } from '../api/types'
import { READ_QUERY_STALE_TIME_MS } from '../lib/query-defaults'

export interface LeaderboardPlayerStats {
  playerId: string
  playerName: string
  avatarUrl: string | null
  total: number
  deaths: number
  yeets: number
}

interface QueryEnabledOptions {
  enabled?: boolean
}

export function useSeasonLeaders(seasonId?: string, options?: QueryEnabledOptions) {
  return useQuery({
    queryKey: ['season-leaders', seasonId ?? 'current'],
    queryFn: () => fetchSeasonLeaders(seasonId),
    enabled: (options?.enabled ?? true) && seasonId !== undefined,
    staleTime: READ_QUERY_STALE_TIME_MS,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  })
}

export function usePlayerStats(
  playerId: string | undefined,
  seasonId?: string,
  options?: QueryEnabledOptions,
) {
  return useQuery({
    queryKey: ['player-stats', playerId, seasonId],
    queryFn: () => {
      if (!playerId) throw new Error('Missing player id')
      if (!seasonId) throw new Error('Missing season id')
      return fetchPlayerStats(playerId, seasonId)
    },
    enabled: (options?.enabled ?? true) && !!playerId && !!seasonId,
    staleTime: READ_QUERY_STALE_TIME_MS,
    placeholderData: keepPreviousData,
  })
}

export function usePlayerStatsBySlug(
  playerSlug: string | undefined,
  seasonId?: string,
  options?: QueryEnabledOptions,
) {
  return useQuery({
    queryKey: ['player-stats-by-slug', playerSlug, seasonId],
    queryFn: () => {
      if (!playerSlug) throw new Error('Missing player slug')
      if (!seasonId) throw new Error('Missing season id')
      return fetchPlayerStatsBySlug(playerSlug, seasonId)
    },
    enabled: (options?.enabled ?? true) && !!playerSlug && !!seasonId,
    staleTime: READ_QUERY_STALE_TIME_MS,
    placeholderData: keepPreviousData,
  })
}

export function useSeasons() {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: async () => {
      const response = await fetchSeasons()
      return response.seasons
    },
    staleTime: READ_QUERY_STALE_TIME_MS,
  })
}

export function useCurrentSeasonDungeons(seasonId?: string, options?: QueryEnabledOptions) {
  return useQuery({
    queryKey: ['season-dungeons', seasonId ?? 'current'],
    queryFn: async () => {
      const response = await fetchCurrentSeasonDungeons(seasonId)
      return response.dungeons
    },
    enabled: (options?.enabled ?? true) && seasonId !== undefined,
    staleTime: READ_QUERY_STALE_TIME_MS,
    placeholderData: keepPreviousData,
  })
}

export function useDungeonLeaderboard(
  seasonId: string | undefined,
  dungeonId: string | undefined,
  options?: QueryEnabledOptions,
) {
  return useQuery({
    queryKey: ['dungeon-leaderboard', seasonId, dungeonId],
    queryFn: () => {
      if (!seasonId) throw new Error('Missing season id')
      if (!dungeonId) throw new Error('Missing dungeon id')
      return fetchDungeonLeaderboard(seasonId, dungeonId)
    },
    enabled: (options?.enabled ?? true) && !!seasonId && !!dungeonId,
    staleTime: READ_QUERY_STALE_TIME_MS,
    placeholderData: keepPreviousData,
  })
}

export function deriveLeaderboard(entries: LeaderboardEntry[]): LeaderboardPlayerStats[] {
  return entries.map((entry) => ({
    playerId: entry.playerId,
    playerName: entry.displayName,
    avatarUrl: entry.avatarUrl,
    total: entry.totalMistakes,
    deaths: entry.totalDeaths,
    yeets: entry.totalYeets,
  }))
}

export function calculateTotalStats(entries: LeaderboardEntry[]) {
  return entries.reduce(
    (totals, entry) => ({
      total: totals.total + entry.totalMistakes,
      deaths: totals.deaths + entry.totalDeaths,
      yeets: totals.yeets + entry.totalYeets,
    }),
    { total: 0, deaths: 0, yeets: 0 },
  )
}
