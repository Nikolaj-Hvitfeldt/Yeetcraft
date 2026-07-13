import type { DungeonSummary, LeaderboardEntry, PlayerSummary, SeasonSummary } from '../api/types'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value)
}

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
  if (isUuid(slug)) return seasons.find((season) => season.id === slug)
  return seasons.find((season) => toSlug(season.name) === slug)
}

export function findPlayerBySlug(
  players: Array<Pick<LeaderboardEntry, 'playerId' | 'displayName'>>,
  slug: string | undefined,
): Pick<LeaderboardEntry, 'playerId' | 'displayName'> | undefined {
  if (!slug) return undefined
  if (isUuid(slug)) return players.find((player) => player.playerId === slug)
  return players.find((player) => toSlug(player.displayName) === slug)
}

export function findDungeonBySlug(
  dungeons: Array<Pick<DungeonSummary, 'id' | 'name'>>,
  slug: string | undefined,
): Pick<DungeonSummary, 'id' | 'name'> | undefined {
  if (!slug) return undefined
  if (isUuid(slug)) return dungeons.find((dungeon) => dungeon.id === slug)
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
