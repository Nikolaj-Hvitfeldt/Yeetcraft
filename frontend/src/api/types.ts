export interface HealthResponse {
  status: string
  timestamp: number
}

/**
 * Mistake type enum matching backend MistakeType.
 * JSON serialization uses lowercase string values.
 */
export type MistakeType = 'wipe' | 'death' | 'yeet'

export interface MistakeDto {
  id: number
  playerName: string
  dungeon: string
  type: MistakeType
  description: string
  timestamp: number
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

// TODO: Add more types as backend endpoints are added:
// export interface CreateMistakeRequest { ... }
// export interface PlayerStats { ... }
