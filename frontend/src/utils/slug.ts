import type { DungeonSummary, LeaderboardEntry, PlayerSummary, SeasonSummary } from '../api/types'

export function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function findSeasonBySlug(
  seasons: SeasonSummary[],
  slug: string | undefined,
): SeasonSummary | undefined {
  if (!slug) return undefined
  return seasons.find((season) => toSlug(season.name) === slug)
}

export function findPlayerBySlug(
  players: Array<Pick<LeaderboardEntry, 'playerId' | 'displayName'>>,
  slug: string | undefined,
): Pick<LeaderboardEntry, 'playerId' | 'displayName'> | undefined {
  if (!slug) return undefined
  return players.find((player) => toSlug(player.displayName) === slug)
}

export function findDungeonBySlug<T extends Pick<DungeonSummary, 'id' | 'name'>>(
  dungeons: T[],
  slug: string | undefined,
): T | undefined {
  if (!slug) return undefined
  return dungeons.find((dungeon) => toSlug(dungeon.name) === slug)
}

export function playerSlug(player: Pick<PlayerSummary | LeaderboardEntry, 'displayName'>): string {
  return toSlug(player.displayName)
}

export function dungeonSlug(dungeon: Pick<DungeonSummary, 'name'>): string {
  return toSlug(dungeon.name)
}

export function seasonSlug(season: Pick<SeasonSummary, 'name'>): string {
  return toSlug(season.name)
}
