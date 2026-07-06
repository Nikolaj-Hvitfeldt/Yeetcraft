export interface HealthResponse {
  status: string
  timestamp: number
}

export type StatField = 'deaths' | 'yeets'

export interface LeaderboardEntry {
  playerId: string
  displayName: string
  avatarUrl: string | null
  totalDeaths: number
  totalYeets: number
  totalMistakes: number
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
}

export interface PlayerSummary {
  id: string
  displayName: string
  avatarUrl: string | null
}

export interface SeasonSummary {
  id: string
  name: string
  expansion: string | null
  isCurrent: boolean
}

export interface DungeonSummary {
  id: string
  name: string
  shortName: string | null
  displayOrder: number
  totalDeaths: number
  totalYeets: number
  totalMistakes: number
}

export interface DungeonStats {
  dungeon: DungeonSummary
  deaths: number
  yeets: number
  totalMistakes: number
}

export interface PlayerStatsResponse {
  player: PlayerSummary
  season: SeasonSummary
  totalDeaths: number
  totalYeets: number
  totalMistakes: number
  dungeons: DungeonStats[]
}

export interface SeasonsResponse {
  seasons: SeasonSummary[]
}

export interface CurrentSeasonDungeonsResponse {
  season: SeasonSummary
  dungeons: DungeonSummary[]
}

export interface StatRow {
  playerId: string
  seasonId: string
  dungeonId: string
  deaths: number
  yeets: number
  totalMistakes: number
}

export interface StatResponse {
  stats: StatRow
}

export interface SetStatsRequest {
  playerId: string
  seasonId: string
  dungeonId: string
  deaths: number
  yeets: number
}

export interface AdjustStatRequest {
  playerId: string
  seasonId: string
  dungeonId: string
  field: StatField
  delta: number
}

/**
 * Error response DTO matching backend ErrorResponse.
 */
export interface ErrorResponse {
  error: string
  message?: string
}
