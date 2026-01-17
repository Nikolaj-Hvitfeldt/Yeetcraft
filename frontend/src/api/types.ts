/**
 * TypeScript types mirroring backend DTOs.
 * 
 * Architecture notes:
 * - Types are kept in sync with backend Kotlin data classes
 * - Shared types ensure type safety across the full stack
 * - All API responses are typed for compile-time safety
 */

export interface HealthResponse {
  status: string
  timestamp: number
}

export interface MistakeDto {
  id: number
  playerName: string
  dungeon: string
  type: string // "wipe", "death", "yeet"
  description: string
  timestamp: number
}

export interface MistakeListResponse {
  mistakes: MistakeDto[]
}

// TODO: Add more types as backend endpoints are added:
// export interface CreateMistakeRequest { ... }
// export interface PlayerStats { ... }
