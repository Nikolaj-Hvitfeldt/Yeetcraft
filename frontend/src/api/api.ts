import {
  AdjustStatRequest,
  CurrentSeasonDungeonsResponse,
  HealthResponse,
  LeaderboardResponse,
  PlayerStatsResponse,
  SeasonsResponse,
  SetStatsRequest,
  StatResponse,
} from './types'
import { getAccessToken } from '../utils/token'

// Default to same-origin /api so Vite proxies to the backend in dev.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * Generic fetch wrapper with automatic token handling.
 * 
 * Automatically includes the access token from URL or localStorage
 * in the X-API-Key header for all requests.
 */
async function fetchApi<T>(endpoint: string, options: FetchApiOptions = {}): Promise<T> {
  const token = getAccessToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  // Automatically include token in header if available
  if (token) {
    headers['X-API-Key'] = token
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      // Only clear when we sent a token that the server rejected.
      if (token) {
        localStorage.removeItem('yeetcraft_token')
      }
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

export async function fetchLeaderboard(seasonId?: string): Promise<LeaderboardResponse> {
  const query = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : ''
  return fetchApi<LeaderboardResponse>(`/api/leaderboard${query}`)
}

export async function fetchPlayerStats(playerId: string, seasonId?: string): Promise<PlayerStatsResponse> {
  const query = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : ''
  return fetchApi<PlayerStatsResponse>(`/api/players/${encodeURIComponent(playerId)}/stats${query}`)
}

export async function fetchSeasons(): Promise<SeasonsResponse> {
  return fetchApi<SeasonsResponse>('/api/seasons')
}

export async function fetchCurrentSeasonDungeons(): Promise<CurrentSeasonDungeonsResponse> {
  return fetchApi<CurrentSeasonDungeonsResponse>('/api/seasons/current/dungeons')
}

export async function setStats(request: SetStatsRequest): Promise<StatResponse> {
  return fetchApi<StatResponse>('/api/stats', {
    method: 'PATCH',
    body: request,
  })
}

export async function adjustStats(request: AdjustStatRequest): Promise<StatResponse> {
  return fetchApi<StatResponse>('/api/stats/adjust', {
    method: 'POST',
    body: request,
  })
}

interface FetchApiOptions {
  method?: 'GET' | 'PATCH' | 'POST'
  body?: unknown
}
