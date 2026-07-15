import { describe, expect, it } from 'vitest'
import type { PlayerStatsResponse } from '../api/types'
import { applyDungeonUpdates } from './player-stats-cache'

const playerStats: PlayerStatsResponse = {
  player: { id: 'p1', displayName: 'Alpha', avatarUrl: null },
  season: { id: 's1', name: 'Season 1', expansion: null, isCurrent: true },
  totalDeaths: 1,
  totalYeets: 2,
  totalMistakes: 3,
  dungeons: [
    {
      dungeon: {
        id: 'd1',
        name: 'Dungeon 1',
        shortName: null,
        displayOrder: 1,
        totalDeaths: 1,
        totalYeets: 2,
        totalMistakes: 3,
      },
      deaths: 1,
      yeets: 2,
      totalMistakes: 3,
    },
  ],
}

describe('applyDungeonUpdates', () => {
  it('applies absolute dungeon stat updates and recalculates totals', () => {
    const updated = applyDungeonUpdates(playerStats, [{ dungeonId: 'd1', deaths: 4, yeets: 5 }])

    expect(updated.dungeons[0]?.deaths).toBe(4)
    expect(updated.dungeons[0]?.yeets).toBe(5)
    expect(updated.totalDeaths).toBe(4)
    expect(updated.totalYeets).toBe(5)
    expect(updated.totalMistakes).toBe(9)
  })
})
