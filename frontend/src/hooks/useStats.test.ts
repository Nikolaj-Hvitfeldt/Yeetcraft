import { describe, expect, it } from 'vitest'
import { deriveLeaderboard, getSeasonKings } from './useStats'
import type { LeaderboardEntry } from '../api/types'

const entries: LeaderboardEntry[] = [
  {
    playerId: 'p1',
    displayName: 'Alpha',
    avatarUrl: null,
    totalDeaths: 2,
    totalYeets: 8,
    totalMistakes: 10,
  },
  {
    playerId: 'p2',
    displayName: 'Bravo',
    avatarUrl: null,
    totalDeaths: 5,
    totalYeets: 3,
    totalMistakes: 8,
  },
  {
    playerId: 'p3',
    displayName: 'Charlie',
    avatarUrl: null,
    totalDeaths: 1,
    totalYeets: 8,
    totalMistakes: 9,
  },
]

describe('deriveLeaderboard', () => {
  it('sorts by total mistakes then yeets', () => {
    const leaderboard = deriveLeaderboard(entries)

    expect(leaderboard.map((player) => player.playerId)).toEqual(['p1', 'p3', 'p2'])
  })
})

describe('getSeasonKings', () => {
  it('picks yeets and deaths leaders with tie-breakers', () => {
    const leaderboard = deriveLeaderboard(entries)
    const kings = getSeasonKings(leaderboard)

    expect(kings.kingOfYeetsId).toBe('p1')
    expect(kings.kingOfDeathsId).toBe('p2')
  })
})
