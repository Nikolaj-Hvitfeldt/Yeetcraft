export const PERSISTED_QUERY_ROOTS = [
  'seasons',
  'season-leaders',
  'season-dungeons',
  'player-stats',
  'player-stats-by-slug',
  'dungeon-leaderboard',
] as const

export type PersistedQueryRoot = (typeof PERSISTED_QUERY_ROOTS)[number]

const persistedQueryRootSet = new Set<string>(PERSISTED_QUERY_ROOTS)

export function isPersistedQueryRoot(root: string): root is PersistedQueryRoot {
  return persistedQueryRootSet.has(root)
}

export const queryKeys = {
  seasons: () => ['seasons'] as const,
  seasonLeaders: (seasonId: string | undefined) =>
    ['season-leaders', seasonId ?? 'current'] as const,
  seasonDungeons: (seasonId: string | undefined) =>
    ['season-dungeons', seasonId ?? 'current'] as const,
  playerStats: (playerId: string | undefined, seasonId: string | undefined) =>
    ['player-stats', playerId, seasonId] as const,
  playerStatsRoot: () => ['player-stats'] as const,
  playerStatsBySlug: (playerSlug: string | undefined, seasonId: string | undefined) =>
    ['player-stats-by-slug', playerSlug, seasonId] as const,
  playerStatsBySlugRoot: () => ['player-stats-by-slug'] as const,
  dungeonLeaderboard: (seasonId: string | undefined, dungeonId: string | undefined) =>
    ['dungeon-leaderboard', seasonId, dungeonId] as const,
}
