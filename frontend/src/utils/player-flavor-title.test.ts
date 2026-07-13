import { describe, expect, it } from 'vitest'
import type { DungeonStats, SeasonLeadersResponse } from '../api/types'
import { getPlayerFlavorTitle, type FlavorTitleInput } from './player-flavor-title'

const PLAYER_ID = '11111111-1111-4111-8111-111111111111'
const OTHER_PLAYER_ID = '22222222-2222-4222-8222-222222222222'

function makeDungeon(
  id: string,
  name: string,
  deaths: number,
  yeets: number,
  shortName: string | null = null,
): DungeonStats {
  const totalMistakes = deaths + yeets

  return {
    dungeon: {
      id,
      name,
      shortName,
      displayOrder: 0,
      totalDeaths: deaths,
      totalYeets: yeets,
      totalMistakes,
    },
    deaths,
    yeets,
    totalMistakes,
  }
}

function makeInput(overrides: Partial<FlavorTitleInput> = {}): FlavorTitleInput {
  return {
    totalDeaths: 0,
    totalYeets: 0,
    totalMistakes: 0,
    dungeons: [],
    playerId: PLAYER_ID,
    seasonLeaders: null,
    leaderboardRank: null,
    ...overrides,
  }
}

function makeSeasonLeaders(overrides: Partial<SeasonLeadersResponse> = {}): SeasonLeadersResponse {
  return {
    season: {
      id: 'season-1',
      name: 'Season 1',
      expansion: 'Midnight',
      isCurrent: true,
    },
    kingOfYeets: null,
    kingOfDeaths: null,
    topPlayer: null,
    dungeonMistakeLeaders: [],
    ...overrides,
  }
}

describe('getPlayerFlavorTitle', () => {
  it('returns loading screen title when player has zero mistakes', () => {
    expect(getPlayerFlavorTitle(makeInput())).toBe('Still on the Loading Screen')
  })

  it('returns yeet-heavy title for high yeet ratio', () => {
    const title = getPlayerFlavorTitle(
      makeInput({
        totalDeaths: 16,
        totalYeets: 44,
        totalMistakes: 60,
        dungeons: [
          makeDungeon('d1', 'Skyreach', 4, 11),
          makeDungeon('d2', 'Pit of Saron', 4, 11),
          makeDungeon('d3', 'Ruby Life Pools', 4, 11),
          makeDungeon('d4', 'Murder Row', 4, 11),
        ],
      }),
    )

    expect(title).toBe('Cliff Diver')
  })

  it('returns death-heavy title for high death ratio', () => {
    const title = getPlayerFlavorTitle(
      makeInput({
        totalDeaths: 30,
        totalYeets: 8,
        totalMistakes: 38,
        dungeons: [
          makeDungeon('d1', 'Skyreach', 8, 2),
          makeDungeon('d2', 'Pit of Saron', 8, 2),
          makeDungeon('d3', 'Ruby Life Pools', 8, 2),
          makeDungeon('d4', 'Murder Row', 6, 2),
        ],
      }),
    )

    expect(title).toBe('Floor Inspector')
  })

  it('returns favorite victim only for the dungeon mistake leader', () => {
    const title = getPlayerFlavorTitle(
      makeInput({
        totalDeaths: 20,
        totalYeets: 30,
        totalMistakes: 50,
        dungeons: [
          makeDungeon('d1', 'Altar of Fangs', 15, 20, 'AOF'),
          makeDungeon('d2', 'Skyreach', 5, 10, 'SR'),
        ],
        seasonLeaders: makeSeasonLeaders({
          dungeonMistakeLeaders: [
            { dungeonId: 'd1', playerId: PLAYER_ID, totalMistakes: 35 },
          ],
        }),
      }),
    )

    expect(title).toBe("Altar of Fangs's Favorite Victim")
  })

  it('does not give favorite victim when another player leads the dungeon', () => {
    const title = getPlayerFlavorTitle(
      makeInput({
        totalDeaths: 1,
        totalYeets: 0,
        totalMistakes: 1,
        dungeons: [makeDungeon('d1', 'Skyreach', 1, 0)],
        seasonLeaders: makeSeasonLeaders({
          dungeonMistakeLeaders: [
            { dungeonId: 'd1', playerId: OTHER_PLAYER_ID, totalMistakes: 2 },
          ],
        }),
      }),
    )

    expect(title).toBe('Held Hostage by Skyreach')
  })

  it('uses dungeon name for medium personal nemesis share when not the dungeon leader', () => {
    const title = getPlayerFlavorTitle(
      makeInput({
        totalDeaths: 23,
        totalYeets: 37,
        totalMistakes: 60,
        dungeons: [
          makeDungeon('d1', 'Pit of Saron', 10, 15),
          makeDungeon('d2', 'Skyreach', 8, 12),
          makeDungeon('d3', 'Murder Row', 5, 10),
        ],
        seasonLeaders: makeSeasonLeaders({
          dungeonMistakeLeaders: [
            { dungeonId: 'd2', playerId: OTHER_PLAYER_ID, totalMistakes: 30 },
          ],
        }),
      }),
    )

    expect(title).toBe('Held Hostage by Pit of Saron')
  })

  it('returns king of yeets title over ratio-based titles', () => {
    const title = getPlayerFlavorTitle(
      makeInput({
        totalDeaths: 30,
        totalYeets: 10,
        totalMistakes: 40,
        dungeons: [makeDungeon('d1', 'Skyreach', 30, 10)],
        seasonLeaders: makeSeasonLeaders({
          kingOfYeets: {
            playerId: PLAYER_ID,
            displayName: 'Martin',
            avatarUrl: null,
            yeets: 10,
            deaths: 30,
          },
        }),
      }),
    )

    expect(title).toBe('Fall Guy')
  })

  it('returns king of deaths title over ratio-based titles', () => {
    const title = getPlayerFlavorTitle(
      makeInput({
        totalDeaths: 10,
        totalYeets: 30,
        totalMistakes: 40,
        dungeons: [makeDungeon('d1', 'Skyreach', 10, 30)],
        seasonLeaders: makeSeasonLeaders({
          kingOfDeaths: {
            playerId: PLAYER_ID,
            displayName: 'Martin',
            avatarUrl: null,
            yeets: 30,
            deaths: 10,
          },
        }),
      }),
    )

    expect(title).toBe('Gravekeeper')
  })

  it('returns leaderboard sovereign title for rank one', () => {
    const title = getPlayerFlavorTitle(
      makeInput({
        totalDeaths: 10,
        totalYeets: 30,
        totalMistakes: 40,
        leaderboardRank: 1,
        dungeons: [makeDungeon('d1', 'Skyreach', 10, 30)],
      }),
    )

    expect(title).toBe('Shamed King')
  })

  it('returns chronic tourist for spread mistakes with low nemesis share', () => {
    const title = getPlayerFlavorTitle(
      makeInput({
        totalDeaths: 12,
        totalYeets: 18,
        totalMistakes: 30,
        dungeons: [
          makeDungeon('d1', 'Dungeon 1', 2, 3),
          makeDungeon('d2', 'Dungeon 2', 2, 3),
          makeDungeon('d3', 'Dungeon 3', 2, 3),
          makeDungeon('d4', 'Dungeon 4', 2, 3),
          makeDungeon('d5', 'Dungeon 5', 2, 3),
          makeDungeon('d6', 'Dungeon 6', 2, 3),
        ],
      }),
    )

    expect(title).toBe('Chronic Tourist')
  })

  it('returns equal opportunity blunderer for balanced high-volume mistakes', () => {
    const title = getPlayerFlavorTitle(
      makeInput({
        totalDeaths: 20,
        totalYeets: 20,
        totalMistakes: 40,
        dungeons: [
          makeDungeon('d1', 'Dungeon 1', 5, 5),
          makeDungeon('d2', 'Dungeon 2', 5, 5),
          makeDungeon('d3', 'Dungeon 3', 5, 5),
          makeDungeon('d4', 'Dungeon 4', 5, 5),
        ],
      }),
    )

    expect(title).toBe('Equal Opportunity Blunderer')
  })

  it('returns fallback title when no rule matches', () => {
    const title = getPlayerFlavorTitle(
      makeInput({
        totalDeaths: 12,
        totalYeets: 18,
        totalMistakes: 30,
        dungeons: [
          makeDungeon('d1', 'Dungeon 1', 4, 6),
          makeDungeon('d2', 'Dungeon 2', 4, 6),
          makeDungeon('d3', 'Dungeon 3', 4, 6),
        ],
      }),
    )

    expect(title).toBe('Season Adventurer')
  })

  it('does not assign king titles to other players', () => {
    const title = getPlayerFlavorTitle(
      makeInput({
        totalDeaths: 16,
        totalYeets: 44,
        totalMistakes: 60,
        playerId: OTHER_PLAYER_ID,
        dungeons: [
          makeDungeon('d1', 'Skyreach', 4, 11),
          makeDungeon('d2', 'Pit of Saron', 4, 11),
          makeDungeon('d3', 'Ruby Life Pools', 4, 11),
          makeDungeon('d4', 'Murder Row', 4, 11),
        ],
        seasonLeaders: makeSeasonLeaders({
          kingOfYeets: {
            playerId: PLAYER_ID,
            displayName: 'Martin',
            avatarUrl: null,
            yeets: 30,
            deaths: 10,
          },
        }),
      }),
    )

    expect(title).toBe('Cliff Diver')
  })
})
