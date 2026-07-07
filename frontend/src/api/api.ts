import {
  CurrentSeasonDungeonsResponse,
  LeaderboardResponse,
  PlayerStatsResponse,
  SeasonsResponse,
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
async function fetchApi<T>(endpoint: string): Promise<T> {
  const token = getAccessToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['X-API-Key'] = token
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers })

  if (!response.ok) {
    if (response.status === 401) {
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

export async function fetchCurrentSeasonDungeons(seasonId?: string): Promise<CurrentSeasonDungeonsResponse> {
  const query = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : ''
  return fetchApi<CurrentSeasonDungeonsResponse>(`/api/seasons/current/dungeons${query}`)
}
