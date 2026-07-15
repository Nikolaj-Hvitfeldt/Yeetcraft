import type { SetPlayerStatsBatchRequest } from './types'

export function mergeSetPlayerStatsPayload(
  existing: SetPlayerStatsBatchRequest,
  incoming: SetPlayerStatsBatchRequest,
): SetPlayerStatsBatchRequest {
  const byDungeonId = new Map(existing.stats.map((row) => [row.dungeonId, row]))

  for (const row of incoming.stats) {
    byDungeonId.set(row.dungeonId, row)
  }

  return {
    playerId: incoming.playerId,
    seasonId: incoming.seasonId,
    stats: Array.from(byDungeonId.values()),
  }
}
