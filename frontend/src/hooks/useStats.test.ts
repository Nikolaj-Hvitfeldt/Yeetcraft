import { describe, expect, it } from 'vitest'
import { deriveLeaderboard } from './useStats'
import type { LeaderboardEntry } from '../api/types'
import type { LeaderboardPlayerStats } from './useStats'

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

function findStatLeader(
  leaderboard: LeaderboardPlayerStats[],
  getValue: (player: LeaderboardPlayerStats) => number,
  tieBreak: (player: LeaderboardPlayerStats) => number,
): string | null {
  if (leaderboard.length === 0) return null

  const maxValue = Math.max(...leaderboard.map(getValue))
  if (maxValue === 0) return null

  const leader = [...leaderboard]
    .filter((player) => getValue(player) === maxValue)
    .sort((first, second) => tieBreak(second) - tieBreak(first))[0]

  return leader?.playerId ?? null
}

/** Mirrors server crown tie-break rules documented in backend/internal/repository/leaders.go */
function getSeasonKings(leaderboard: LeaderboardPlayerStats[]) {
  return {
    kingOfYeetsId: findStatLeader(
      leaderboard,
      (player) => player.yeets,
      (player) => player.deaths,
    ),
    kingOfDeathsId: findStatLeader(
      leaderboard,
      (player) => player.deaths,
      (player) => player.yeets,
    ),
  }
}

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
