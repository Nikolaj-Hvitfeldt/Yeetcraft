import { z } from 'zod'
import {
  CurrentSeasonDungeonsResponseSchema,
  LeaderboardResponseSchema,
  PlayerStatsResponseSchema,
  StatResponseSchema,
  SeasonLeadersResponseSchema,
  SeasonsResponseSchema,
  SetStatsRequestSchema,
  SetStatsBatchRequestSchema,
  StatsBatchResponseSchema,
} from './schemas'
import { getAccessToken } from '../utils/token'

// Default to same-origin /api so Vite proxies to the backend in dev.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * Generic fetch wrapper with automatic token handling.
 *
 * Automatically includes the access token from URL or localStorage
 * in the X-API-Key header for all requests.
 */
async function fetchApi<T>(endpoint: string, schema: z.ZodType<T>): Promise<T> {
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

  const json: unknown = await response.json()

  try {
    return schema.parse(json)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid response from ${endpoint}: ${error.message}`)
    }
    throw error
  }
}

export async function fetchLeaderboard(seasonId?: string) {
  const query = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : ''
  return fetchApi(`/api/leaderboard${query}`, LeaderboardResponseSchema)
}

export async function fetchSeasonLeaders(seasonId?: string) {
  const query = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : ''
  return fetchApi(`/api/seasons/leaders${query}`, SeasonLeadersResponseSchema)
}

export async function fetchPlayerStats(playerId: string, seasonId?: string) {
  const query = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : ''
  return fetchApi(
    `/api/players/${encodeURIComponent(playerId)}/stats${query}`,
    PlayerStatsResponseSchema,
  )
}

export async function fetchSeasons() {
  return fetchApi('/api/seasons', SeasonsResponseSchema)
}

export async function fetchCurrentSeasonDungeons(seasonId?: string) {
  const query = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : ''
  return fetchApi(`/api/seasons/current/dungeons${query}`, CurrentSeasonDungeonsResponseSchema)
}

export async function fetchSetStats(request: z.infer<typeof SetStatsRequestSchema>) {
  // Ensure we validate the request shape at runtime too (helps catch mistakes early).
  SetStatsRequestSchema.parse(request)

  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/api/stats`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-API-Key': token } : {}),
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    if (response.status === 401) {
      const error = await response.json().catch(() => ({ message: 'Unauthorized' }))
      throw new Error(error.message || 'Unauthorized. Please use the shared link with a valid token.')
    }
    const errorText = await response.text().catch(() => response.statusText)
    throw new Error(`API error: ${response.status} ${errorText}`)
  }

  const json: unknown = await response.json()
  return StatResponseSchema.parse(json).stats
}

export async function fetchSetStatsBatch(request: z.infer<typeof SetStatsBatchRequestSchema>) {
  SetStatsBatchRequestSchema.parse(request)

  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/api/stats/batch`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-API-Key': token } : {}),
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    if (response.status === 401) {
      const error = await response.json().catch(() => ({ message: 'Unauthorized' }))
      throw new Error(error.message || 'Unauthorized. Please use the shared link with a valid token.')
    }
    const errorText = await response.text().catch(() => response.statusText)
    throw new Error(`API error: ${response.status} ${errorText}`)
  }

  const json: unknown = await response.json()
  return StatsBatchResponseSchema.parse(json).stats
}
