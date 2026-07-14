import type { DungeonSummary, LeaderboardEntry, PlayerSummary, SeasonSummary } from '../api/types'
import { dungeonSlug, findSeasonBySlug, playerSlug, seasonSlug, toSlug } from './slug'

export function buildSeasonHomePath(season: Pick<SeasonSummary, 'name'>): string {
  return `/${seasonSlug(season)}`
}

export function buildPlayerPath(
  season: Pick<SeasonSummary, 'name'>,
  player: Pick<PlayerSummary | LeaderboardEntry, 'displayName'>,
): string {
  return `/${seasonSlug(season)}/player/${playerSlug(player)}`
}

export function buildDungeonPath(
  season: Pick<SeasonSummary, 'name'>,
  dungeon: Pick<DungeonSummary, 'name'>,
): string {
  return `/${seasonSlug(season)}/dungeon/${dungeonSlug(dungeon)}`
}

export interface PageBackState {
  backTo?: string
}

export function buildPageBackState(backTo: string): PageBackState {
  return { backTo }
}

export interface DungeonDetailLocationState extends PageBackState {
  returnState?: PageBackState
}

export function buildDungeonDetailState(
  backTo: string,
  options?: { returnState?: PageBackState },
): DungeonDetailLocationState {
  return {
    backTo,
    returnState: options?.returnState,
  }
}

export function replaceSeasonSlugInPath(
  pathname: string,
  seasons: SeasonSummary[],
  nextSeason: SeasonSummary,
): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return buildSeasonHomePath(nextSeason)

  const currentSeason = findSeasonBySlug(seasons, segments[0])
  if (!currentSeason) return buildSeasonHomePath(nextSeason)

  segments[0] = toSlug(nextSeason.name)
  return `/${segments.join('/')}`
}
