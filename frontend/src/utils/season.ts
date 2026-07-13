import type { SeasonSummary } from '../api/types'

export function findSelectedSeason(
  seasons: SeasonSummary[],
  seasonId: string | null | undefined,
): SeasonSummary | undefined {
  if (seasonId) {
    const matchedSeason = seasons.find((season) => season.id === seasonId)
    if (matchedSeason) return matchedSeason
  }

  return seasons.find((season) => season.isCurrent) ?? seasons[0]
}

export function resolveSeasonId(
  requestedSeasonId: string | null | undefined,
  seasons: SeasonSummary[] | undefined,
): string | undefined {
  if (requestedSeasonId) {
    if (!seasons || seasons.length === 0) {
      return requestedSeasonId
    }

    if (seasons.some((season) => season.id === requestedSeasonId)) {
      return requestedSeasonId
    }
  }

  if (!seasons || seasons.length === 0) {
    return undefined
  }

  return seasons.find((season) => season.isCurrent)?.id ?? seasons[0]?.id
}

export function seasonPath(path: string, seasonId: string | undefined): string {
  if (!seasonId) return path
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}seasonId=${encodeURIComponent(seasonId)}`
}
