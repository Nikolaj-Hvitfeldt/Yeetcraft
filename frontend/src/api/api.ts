import { z } from 'zod'
import {
  CurrentSeasonDungeonsResponseSchema,
  DungeonLeaderboardResponseSchema,
  PlayerStatsResponseSchema,
  SeasonLeadersResponseSchema,
  SeasonsResponseSchema,
  SetStatsBatchRequestSchema,
  StatsBatchResponseSchema,
} from './schemas'
import { getAccessToken } from '../utils/token'
import { fetchWithTimeout } from '../lib/fetch-with-timeout'
import { parseApiResponse, throwForFailedResponse } from '../lib/api-response'

// Default to same-origin /api so Vite proxies to the backend in dev.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

function buildSeasonQuery(seasonId?: string): string {
  return seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : ''
}

function buildWriteHeaders(): HeadersInit {
  const token = getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'X-API-Key': token } : {}),
  }
}

/**
 * Public read fetch wrapper. Does not send write-access headers.
 */
async function fetchApi<T>(endpoint: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    await throwForFailedResponse(response, null)
  }

  const json: unknown = await response.json()
  return parseApiResponse(json, schema, endpoint)
}

/**
 * Protected write fetch wrapper. Sends X-API-Key when a write token is stored.
 */
async function fetchApiWithBody<T>(
  endpoint: string,
  method: 'PATCH',
  body: unknown,
  schema: z.ZodType<T>,
): Promise<T> {
  const token = getAccessToken()
  const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: buildWriteHeaders(),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    await throwForFailedResponse(response, token)
  }

  const json: unknown = await response.json()
  return parseApiResponse(json, schema, endpoint)
}

export async function fetchSeasonLeaders(seasonId?: string) {
  return fetchApi(`/api/seasons/leaders${buildSeasonQuery(seasonId)}`, SeasonLeadersResponseSchema)
}

export async function fetchPlayerStats(playerId: string, seasonId?: string) {
  return fetchApi(
    `/api/players/${encodeURIComponent(playerId)}/stats${buildSeasonQuery(seasonId)}`,
    PlayerStatsResponseSchema,
  )
}

export async function fetchPlayerStatsBySlug(playerSlug: string, seasonId?: string) {
  return fetchApi(
    `/api/players/by-slug/${encodeURIComponent(playerSlug)}/stats${buildSeasonQuery(seasonId)}`,
    PlayerStatsResponseSchema,
  )
}

export async function fetchSeasons() {
  return fetchApi('/api/seasons', SeasonsResponseSchema)
}

export async function fetchCurrentSeasonDungeons(seasonId?: string) {
  return fetchApi(
    `/api/seasons/current/dungeons${buildSeasonQuery(seasonId)}`,
    CurrentSeasonDungeonsResponseSchema,
  )
}

export async function fetchDungeonLeaderboard(seasonId: string, dungeonId: string) {
  return fetchApi(
    `/api/seasons/${encodeURIComponent(seasonId)}/dungeons/${encodeURIComponent(dungeonId)}/leaderboard`,
    DungeonLeaderboardResponseSchema,
  )
}

export async function fetchSetStatsBatch(request: z.infer<typeof SetStatsBatchRequestSchema>) {
  SetStatsBatchRequestSchema.parse(request)
  return fetchApiWithBody('/api/stats/batch', 'PATCH', request, StatsBatchResponseSchema).then(
    (response) => response.stats,
  )
}
