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
