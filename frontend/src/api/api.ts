import { HealthResponse, MistakeListResponse } from './types'

/**
 * API client module.
 * 
 * Architecture notes:
 * - Centralized API calls with typed responses
 * - Base URL configured via environment variable (defaults to localhost:8080)
 * - Error handling in one place
 * - Easy to add authentication headers later if needed
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Generic fetch wrapper with error handling.
 */
async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`)
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * GET /api/health
 * Health check endpoint.
 */
export async function fetchHealth(): Promise<HealthResponse> {
  return fetchApi<HealthResponse>('/api/health')
}

/**
 * GET /api/mistakes
 * Fetch all mistakes.
 * TODO: Add query parameters for filtering (player, dungeon, type, date range)
 */
export async function fetchMistakes(): Promise<MistakeListResponse> {
  return fetchApi<MistakeListResponse>('/api/mistakes')
}

// TODO: Add more API functions as backend endpoints are added:
// export async function fetchMistakeById(id: number): Promise<MistakeDto> { ... }
// export async function createMistake(mistake: CreateMistakeRequest): Promise<MistakeDto> { ... }
