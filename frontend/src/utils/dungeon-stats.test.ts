import { describe, expect, it } from 'vitest'
import type { DungeonLeaderboardEntry, DungeonSummary } from '../api/types'
import {
  getBlameShare,
  getDangerScore,
  getDungeonAchievements,
  getDungeonHighlights,
  getDungeonReputationScores,
  getMeatGrinderSummary,
  getMistakeMix,
  getYeetFactor,
  sortDungeonLeaderboard,
} from './dungeon-stats'

const dungeon: DungeonSummary = {
  id: 'dungeon-1',
  name: 'Nexus-Point Xenas',
  shortName: 'NPX',
  displayOrder: 1,
  totalDeaths: 2,
  totalYeets: 1,
  totalMistakes: 3,
}

const allDungeons: DungeonSummary[] = [
  dungeon,
  {
    id: 'dungeon-2',
    name: 'Ruby Life Pools',
    shortName: 'RLP',
    displayOrder: 2,
    totalDeaths: 1,
    totalYeets: 0,
    totalMistakes: 1,
  },
]

const leaderboard: DungeonLeaderboardEntry[] = [
  {
    playerId: 'p1',
    displayName: 'Niklas',
    avatarUrl: null,
    deaths: 2,
    yeets: 1,
    totalMistakes: 3,
  },
  {
    playerId: 'p2',
    displayName: 'Martin',
    avatarUrl: null,
    deaths: 0,
    yeets: 0,
    totalMistakes: 0,
  },
]

describe('getDungeonHighlights', () => {
  it('picks biggest yeeter, most deaths, and safest player', () => {
    const highlights = getDungeonHighlights(leaderboard)

    expect(highlights.biggestYeeter?.displayName).toBe('Niklas')
    expect(highlights.biggestYeeter?.value).toBe(1)
    expect(highlights.mostDeaths?.displayName).toBe('Niklas')
    expect(highlights.mostDeaths?.value).toBe(2)
    expect(highlights.safestPlayer?.displayName).toBe('Martin')
    expect(highlights.safestPlayer?.value).toBe(0)
  })
})

describe('getMistakeMix', () => {
  it('returns zero-safe percentages', () => {
    expect(getMistakeMix(dungeon)).toEqual({ deathsPercent: 67, yeetsPercent: 33 })
    expect(getMistakeMix({ ...dungeon, totalDeaths: 0, totalYeets: 0, totalMistakes: 0 })).toEqual({
      deathsPercent: 0,
      yeetsPercent: 0,
    })
  })
})

describe('getDangerScore', () => {
  it('compares dungeon mistakes to season average', () => {
    expect(getDangerScore(dungeon, 2)).toBe(75)
    expect(getDangerScore({ ...dungeon, totalMistakes: 0 }, 0)).toBe(0)
  })
})

describe('getYeetFactor', () => {
  it('returns zero when season has no yeets', () => {
    expect(
      getYeetFactor(
        { ...dungeon, totalYeets: 0, totalMistakes: 2 },
        [{ ...dungeon, totalYeets: 0, totalMistakes: 2 }],
      ),
    ).toBe(0)
  })
})

describe('getBlameShare', () => {
  it('returns top offender share of dungeon mistakes', () => {
    expect(getBlameShare(dungeon, leaderboard)).toBe(100)
    expect(getBlameShare({ ...dungeon, totalMistakes: 0 }, leaderboard)).toBe(0)
  })
})

describe('getDungeonAchievements', () => {
  it('builds deterministic achievement copy', () => {
    const achievements = getDungeonAchievements(getDungeonHighlights(leaderboard))

    expect(achievements).toHaveLength(3)
    expect(achievements[0]?.description).toContain('Niklas')
    expect(achievements[1]?.description).toContain('Martin')
    expect(achievements[2]?.description).toContain('Niklas')
  })
})

describe('getMeatGrinderSummary', () => {
  it('summarizes dungeon reputation', () => {
    const summary = getMeatGrinderSummary(dungeon, leaderboard, allDungeons)

    expect(summary.cleanPlayers).toBe(1)
    expect(summary.yeetSharePercent).toBe(33)
    expect(summary.narrative).toContain('3 recorded mistakes')
    expect(summary.narrative).toContain('1 of 2 players')
  })
})

describe('sortDungeonLeaderboard', () => {
  it('sorts by total mistakes then yeets then name', () => {
    const sorted = sortDungeonLeaderboard([
      {
        playerId: 'p2',
        displayName: 'Martin',
        avatarUrl: null,
        deaths: 0,
        yeets: 0,
        totalMistakes: 0,
      },
      {
        playerId: 'p1',
        displayName: 'Niklas',
        avatarUrl: null,
        deaths: 2,
        yeets: 1,
        totalMistakes: 3,
      },
    ])

    expect(sorted[0]?.displayName).toBe('Niklas')
    expect(sorted[1]?.displayName).toBe('Martin')
  })
})

describe('getDungeonReputationScores', () => {
  it('returns all reputation scores', () => {
    const scores = getDungeonReputationScores(dungeon, allDungeons, leaderboard)

    expect(scores.dangerRating).toBeGreaterThan(0)
    expect(scores.blameShare).toBe(100)
  })
})
