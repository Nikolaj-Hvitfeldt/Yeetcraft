export interface HealthResponse {
  status: string
  timestamp: number
}

/**
 * Mistake type enum matching backend MistakeType.
 * JSON serialization uses lowercase string values.
 */
export type MistakeType = 'death' | 'yeet'

export interface MistakeDto {
  id: number
  playerName: string
  characterName: string
  dungeon: string
  type: MistakeType
  description: string
  timestamp: number
}

export interface LeaderboardRow {
  playerName: string
  characterName?: string | null
  deaths: number
  yeets: number
  total: number
}

export interface LeaderboardResponse {
  rows: LeaderboardRow[]
}

export interface MistakeListResponse {
  mistakes: MistakeDto[]
}

/**
 * Error response DTO matching backend ErrorResponse.
 */
export interface ErrorResponse {
  error: string
  message?: string
}
