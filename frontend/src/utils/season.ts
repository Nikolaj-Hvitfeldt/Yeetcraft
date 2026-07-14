import type { SeasonSummary } from '../api/types'
import { findSeasonBySlug } from './slug'

export function formatSeasonLabel(
  season: SeasonSummary | undefined,
  fallback = 'Unknown season',
): string {
  if (!season) return fallback
  return season.expansion ? `${season.expansion} ${season.name}` : season.name
}

export function findSelectedSeason(
  seasons: SeasonSummary[],
  seasonKey: string | null | undefined,
): SeasonSummary | undefined {
  if (seasonKey) {
    const matchedSeason = findSeasonBySlug(seasons, seasonKey)
    if (matchedSeason) return matchedSeason
  }

  return seasons.find((season) => season.isCurrent) ?? seasons[0]
}

export function resolveSeasonId(
  requestedSeasonSlug: string | null | undefined,
  seasons: SeasonSummary[] | undefined,
): string | undefined {
  if (requestedSeasonSlug && seasons?.length) {
    const matchedSeason = findSeasonBySlug(seasons, requestedSeasonSlug)
    if (matchedSeason) return matchedSeason.id
  }

  if (!seasons || seasons.length === 0) {
    return undefined
  }

  return seasons.find((season) => season.isCurrent)?.id ?? seasons[0]?.id
}
