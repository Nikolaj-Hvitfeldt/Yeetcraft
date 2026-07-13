import { describe, expect, it } from 'vitest'
import type { DungeonSummary, LeaderboardEntry, SeasonSummary } from '../api/types'
import {
  buildDungeonPath,
  buildPlayerPath,
  buildSeasonHomePath,
  replaceSeasonSlugInPath,
} from './routes'
import { findDungeonBySlug, findPlayerBySlug, findSeasonBySlug, toSlug } from './slug'

const seasonOneId = '11111111-1111-4111-8111-111111111111'
const playerOneId = '33333333-3333-4333-8333-333333333333'
const dungeonOneId = '44444444-4444-4444-8444-444444444444'

const seasons: SeasonSummary[] = [
  { id: seasonOneId, name: 'Midnight Season 1', expansion: 'Midnight', isCurrent: true },
]

const players: LeaderboardEntry[] = [
  {
    playerId: playerOneId,
    displayName: 'Seb',
    avatarUrl: null,
    totalDeaths: 1,
    totalYeets: 2,
    totalMistakes: 3,
  },
]

const dungeons: DungeonSummary[] = [
  {
    id: dungeonOneId,
    name: "Magisters' Terrace",
    shortName: null,
    displayOrder: 1,
    totalDeaths: 1,
    totalYeets: 2,
    totalMistakes: 3,
  },
]

describe('toSlug', () => {
  it('normalizes names into url-safe slugs', () => {
    expect(toSlug('Seb')).toBe('seb')
    expect(toSlug("Magisters' Terrace")).toBe('magisters-terrace')
    expect(toSlug('Midnight Season 1')).toBe('midnight-season-1')
  })
})

describe('slug lookups', () => {
  it('finds seasons, players, and dungeons by slug', () => {
    expect(findSeasonBySlug(seasons, 'midnight-season-1')?.id).toBe(seasonOneId)
    expect(findPlayerBySlug(players, 'seb')?.playerId).toBe(playerOneId)
    expect(findDungeonBySlug(dungeons, 'magisters-terrace')?.id).toBe(dungeonOneId)
  })

  it('still resolves legacy uuid params', () => {
    expect(findSeasonBySlug(seasons, seasonOneId)?.id).toBe(seasonOneId)
    expect(findPlayerBySlug(players, playerOneId)?.playerId).toBe(playerOneId)
    expect(findDungeonBySlug(dungeons, dungeonOneId)?.id).toBe(dungeonOneId)
  })
})

describe('route builders', () => {
  it('builds readable route paths', () => {
    expect(buildSeasonHomePath(seasons[0])).toBe('/midnight-season-1')
    expect(buildPlayerPath(seasons[0], { displayName: 'Seb' })).toBe(
      '/midnight-season-1/player/seb',
    )
    expect(buildDungeonPath(seasons[0], dungeons[0])).toBe(
      '/midnight-season-1/dungeon/magisters-terrace',
    )
  })

  it('replaces the season slug while preserving nested paths', () => {
    const nextSeason: SeasonSummary = {
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Midnight Season 2',
      expansion: 'Midnight',
      isCurrent: false,
    }

    expect(
      replaceSeasonSlugInPath('/midnight-season-1/player/seb', seasons, nextSeason),
    ).toBe('/midnight-season-2/player/seb')
  })
})
