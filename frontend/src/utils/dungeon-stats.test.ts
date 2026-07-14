import { describe, expect, it } from 'vitest'
import type { DungeonLeaderboardEntry, DungeonSummary } from '../api/types'
import {
  getBlameShare,
  getDangerScore,
  getDungeonHighlights,
  getDungeonReputationScores,
  getMeatGrinderSummary,
  getMistakeMix,
  getReputationVerdicts,
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

  it('scores 50 at season average, 100 at double average, and 0 with no mistakes', () => {
    const atAverage = { ...dungeon, totalMistakes: 4, totalDeaths: 3, totalYeets: 1 }
    expect(getDangerScore(atAverage, 4)).toBe(50)
    expect(getDangerScore({ ...atAverage, totalMistakes: 8 }, 4)).toBe(100)
    expect(getDangerScore({ ...dungeon, totalMistakes: 0, totalDeaths: 0, totalYeets: 0 }, 4)).toBe(0)
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

  it('scores 50 at season yeet share, 100 when doubled, and 0 with no dungeon mistakes', () => {
    const typicalDungeon: DungeonSummary = {
      ...dungeon,
      totalDeaths: 2,
      totalYeets: 2,
      totalMistakes: 4,
    }
    const seasonDungeons: DungeonSummary[] = [
      typicalDungeon,
      {
        ...dungeon,
        id: 'dungeon-2',
        totalDeaths: 2,
        totalYeets: 2,
        totalMistakes: 4,
      },
    ]
    const yeetHeavyDungeon: DungeonSummary = {
      ...dungeon,
      totalDeaths: 0,
      totalYeets: 4,
      totalMistakes: 4,
    }

    expect(getYeetFactor(typicalDungeon, seasonDungeons)).toBe(50)
    expect(getYeetFactor(yeetHeavyDungeon, seasonDungeons)).toBe(100)
    expect(getYeetFactor({ ...typicalDungeon, totalMistakes: 0, totalDeaths: 0, totalYeets: 0 }, seasonDungeons)).toBe(0)
  })
})

describe('getBlameShare', () => {
  it('returns top offender share of dungeon mistakes', () => {
    expect(getBlameShare(dungeon, leaderboard)).toBe(100)
    expect(getBlameShare({ ...dungeon, totalMistakes: 0 }, leaderboard)).toBe(0)
  })

  it('scores lower when mistakes are spread across players', () => {
    const sharedLeaderboard: DungeonLeaderboardEntry[] = [
      {
        playerId: 'p1',
        displayName: 'Niklas',
        avatarUrl: null,
        deaths: 1,
        yeets: 1,
        totalMistakes: 2,
      },
      {
        playerId: 'p2',
        displayName: 'Martin',
        avatarUrl: null,
        deaths: 1,
        yeets: 1,
        totalMistakes: 2,
      },
    ]

    expect(getBlameShare({ ...dungeon, totalMistakes: 4 }, sharedLeaderboard)).toBe(50)
  })
})

describe('getMeatGrinderSummary', () => {
  it('returns a title-themed flavor description with key stats', () => {
    const summary = getMeatGrinderSummary(dungeon, leaderboard, allDungeons)

    expect(summary.title).toBe('The Meat Grinder')
    expect(summary.description.length).toBeGreaterThanOrEqual(50)
    expect(summary.description).toContain('Nexus-Point Xenas')
    expect(summary.description).toContain('3 mistakes')
    expect(summary.description).toMatch(/grind|roughest/i)
  })

  it('describes a spotless dungeon with quiet-lobby flavor', () => {
    const spotlessDungeon = {
      ...dungeon,
      totalDeaths: 0,
      totalYeets: 0,
      totalMistakes: 0,
    }
    const summary = getMeatGrinderSummary(
      spotlessDungeon,
      leaderboard,
      [spotlessDungeon, allDungeons[1]!],
    )

    expect(summary.title).toBe('The Quiet Lobby')
    expect(summary.description).toMatch(/quiet|suspiciously|ledger/i)
  })
})

describe('getReputationVerdicts', () => {
  it('returns danger, yeet, and blame verdicts', () => {
    const scores = getDungeonReputationScores(dungeon, allDungeons, leaderboard)

    expect(getReputationVerdicts(scores, dungeon)).toEqual([
      'Harder than most keys in the season.',
      'Unusually yeet-heavy for the season.',
      'Almost all the blame traces back to one player.',
    ])
  })

  it('handles a spotless dungeon', () => {
    const cleanDungeon = { ...dungeon, totalDeaths: 0, totalYeets: 0, totalMistakes: 0 }

    expect(
      getReputationVerdicts(
        { dangerRating: 0, yeetFactor: 0, blameShare: 0 },
        cleanDungeon,
      ),
    ).toEqual([
      'A quiet key so far. No recorded mistakes yet.',
      'No yeets recorded here yet.',
      'No blame to assign here yet.',
    ])
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
