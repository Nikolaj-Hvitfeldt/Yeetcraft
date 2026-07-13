import type { SeasonSummary } from '../api/types'
import { findSeasonBySlug, isUuid } from './slug'

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
  requestedSeasonKey: string | null | undefined,
  seasons: SeasonSummary[] | undefined,
): string | undefined {
  if (requestedSeasonKey) {
    if (!seasons || seasons.length === 0) {
      return isUuid(requestedSeasonKey) ? requestedSeasonKey : undefined
    }

    const matchedSeason = findSeasonBySlug(seasons, requestedSeasonKey)
    if (matchedSeason) return matchedSeason.id
  }

  if (!seasons || seasons.length === 0) {
    return undefined
  }

  return seasons.find((season) => season.isCurrent)?.id ?? seasons[0]?.id
}
