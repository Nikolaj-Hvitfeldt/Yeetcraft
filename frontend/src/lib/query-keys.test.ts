import { describe, expect, it } from 'vitest'
import { isPersistedQueryRoot, queryKeys } from './query-keys'

describe('queryKeys', () => {
  it('builds stable read query keys', () => {
    expect(queryKeys.seasons()).toEqual(['seasons'])
    expect(queryKeys.seasonLeaders(undefined)).toEqual(['season-leaders', 'current'])
    expect(queryKeys.seasonLeaders('s1')).toEqual(['season-leaders', 's1'])
    expect(queryKeys.playerStats('p1', 's1')).toEqual(['player-stats', 'p1', 's1'])
    expect(queryKeys.playerStatsBySlug('alpha', 's1')).toEqual([
      'player-stats-by-slug',
      'alpha',
      's1',
    ])
    expect(queryKeys.dungeonLeaderboard('s1', 'd1')).toEqual([
      'dungeon-leaderboard',
      's1',
      'd1',
    ])
  })

  it('identifies persisted query roots', () => {
    expect(isPersistedQueryRoot('player-stats')).toBe(true)
    expect(isPersistedQueryRoot('mutations')).toBe(false)
  })
})
