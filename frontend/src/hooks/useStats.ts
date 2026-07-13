import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  fetchCurrentSeasonDungeons,
  fetchPlayerStats,
  fetchSeasonLeaders,
  fetchSeasons,
} from '../api/api'
import { LeaderboardEntry } from '../api/types'

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
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  })
}

/** @deprecated Prefer useSeasonLeaders and read response.leaderboard */
export function useLeaderboard(seasonId?: string, options?: QueryEnabledOptions) {
  const query = useSeasonLeaders(seasonId, options)

  return {
    ...query,
    data: query.data?.leaderboard ?? [],
  }
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
    staleTime: 30_000,
    refetchOnMount: 'always',
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('500')) {
        return failureCount < 2
      }
      return failureCount < 1
    },
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

export function useCurrentSeasonDungeons(seasonId?: string, options?: QueryEnabledOptions) {
  return useQuery({
    queryKey: ['season-dungeons', seasonId ?? 'current'],
    queryFn: async () => {
      const response = await fetchCurrentSeasonDungeons(seasonId)
      return response.dungeons
    },
    enabled: (options?.enabled ?? true) && seasonId !== undefined,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}

export function deriveLeaderboard(entries: LeaderboardEntry[]): LeaderboardPlayerStats[] {
  const leaderboard = entries.map((entry) => ({
    playerId: entry.playerId,
    playerName: entry.displayName,
    avatarUrl: entry.avatarUrl,
    total: entry.totalMistakes,
    deaths: entry.totalDeaths,
    yeets: entry.totalYeets,
  }))

  return leaderboard.sort((firstEntry, secondEntry) => {
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
    { total: 0, deaths: 0, yeets: 0 },
  )
}

export interface SeasonKings {
  kingOfYeetsId: string | null
  kingOfDeathsId: string | null
}

function findStatLeader(
  leaderboard: LeaderboardPlayerStats[],
  getValue: (player: LeaderboardPlayerStats) => number,
  tieBreak: (player: LeaderboardPlayerStats) => number,
): string | null {
  if (leaderboard.length === 0) return null

  const maxValue = Math.max(...leaderboard.map(getValue))
  if (maxValue === 0) return null

  const leader = [...leaderboard]
    .filter((player) => getValue(player) === maxValue)
    .sort((first, second) => tieBreak(second) - tieBreak(first))[0]

  return leader?.playerId ?? null
}

/** Used in tests to document server crown tie-break rules. */
export function getSeasonKings(leaderboard: LeaderboardPlayerStats[]): SeasonKings {
  return {
    kingOfYeetsId: findStatLeader(
      leaderboard,
      (player) => player.yeets,
      (player) => player.deaths,
    ),
    kingOfDeathsId: findStatLeader(
      leaderboard,
      (player) => player.deaths,
      (player) => player.yeets,
    ),
  }
}
