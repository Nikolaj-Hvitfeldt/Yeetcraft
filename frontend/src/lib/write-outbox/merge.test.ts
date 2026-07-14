import { describe, expect, it } from 'vitest'
import { mergeSetPlayerStatsPayload } from './merge'

describe('mergeSetPlayerStatsPayload', () => {
  it('merges dungeon rows with newer values winning per dungeonId', () => {
    const merged = mergeSetPlayerStatsPayload(
      {
        playerId: 'p1',
        seasonId: 's1',
        stats: [
          { dungeonId: 'd1', deaths: 1, yeets: 2 },
          { dungeonId: 'd2', deaths: 3, yeets: 4 },
        ],
      },
      {
        playerId: 'p1',
        seasonId: 's1',
        stats: [
          { dungeonId: 'd1', deaths: 5, yeets: 6 },
          { dungeonId: 'd3', deaths: 7, yeets: 8 },
        ],
      },
    )

    expect(merged.stats).toEqual([
      { dungeonId: 'd1', deaths: 5, yeets: 6 },
      { dungeonId: 'd2', deaths: 3, yeets: 4 },
      { dungeonId: 'd3', deaths: 7, yeets: 8 },
    ])
  })
})
