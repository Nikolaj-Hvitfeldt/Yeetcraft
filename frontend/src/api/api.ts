import { HealthResponse, LeaderboardResponse, MistakeListResponse } from './types'
import { getAccessToken } from '../utils/token'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Generic fetch wrapper with automatic token handling.
 * 
 * Automatically includes the access token from URL or localStorage
 * in the X-API-Key header for all requests.
 */
async function fetchApi<T>(endpoint: string): Promise<T> {
  const token = getAccessToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  // Automatically include token in header if available
  if (token) {
    headers['X-API-Key'] = token
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - clear invalid token
      localStorage.removeItem('yeetcraft_token')
      const error = await response.json().catch(() => ({ message: 'Unauthorized' }))
      throw new Error(error.message || 'Unauthorized. Please use the shared link with a valid token.')
    }
    const errorText = await response.text().catch(() => response.statusText)
    throw new Error(`API error: ${response.status} ${errorText}`)
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
 * Optional query params: player, character, dungeon, type.
 */
export async function fetchMistakes(params?: {
  player?: string
  character?: number
  dungeon?: string
  type?: 'death' | 'yeet'
}): Promise<MistakeListResponse> {
  const search = new URLSearchParams()
  if (params?.player) search.set('player', params.player)
  if (params?.character != null) search.set('character', String(params.character))
  if (params?.dungeon) search.set('dungeon', params.dungeon)
  if (params?.type) search.set('type', params.type)
  const qs = search.toString()
  return fetchApi<MistakeListResponse>(`/api/mistakes${qs ? `?${qs}` : ''}`)
}

/**
 * GET /api/leaderboard?by=player|character
 */
export async function fetchLeaderboard(by: 'player' | 'character'): Promise<LeaderboardResponse> {
  return fetchApi<LeaderboardResponse>(`/api/leaderboard?by=${by}`)
}

// TODO: Add more API functions as backend endpoints are added:
// export async function fetchMistakeById(id: number): Promise<MistakeDto> { ... }
// export async function createMistake(mistake: CreateMistakeRequest): Promise<MistakeDto> { ... }
