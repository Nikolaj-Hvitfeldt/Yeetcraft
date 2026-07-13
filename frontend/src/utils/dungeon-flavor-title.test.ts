import { describe, expect, it } from 'vitest'
import type { DungeonSummary } from '../api/types'
import {
  assignUniqueDungeonTitles,
  getDungeonFlavorTitle,
} from './dungeon-flavor-title'

function makeDungeon(
  id: string,
  name: string,
  deaths: number,
  yeets: number,
  displayOrder = 0,
): DungeonSummary {
  return {
    id,
    name,
    shortName: null,
    displayOrder,
    totalDeaths: deaths,
    totalYeets: yeets,
    totalMistakes: deaths + yeets,
  }
}

describe('assignUniqueDungeonTitles', () => {
  it('assigns one season niche title per dungeon', () => {
    const dungeons = [
      makeDungeon('d1', 'Meat Grinder', 8, 2, 1),
      makeDungeon('d2', 'Launch Pad', 1, 9, 2),
      makeDungeon('d3', 'Graveyard', 10, 0, 3),
      makeDungeon('d4', 'Quiet Lobby', 0, 0, 4),
    ]

    const titles = assignUniqueDungeonTitles({
      allDungeons: dungeons,
      dungeonMistakeLeaders: [
        { dungeonId: 'd1', playerId: 'p1', totalMistakes: 9 },
        { dungeonId: 'd2', playerId: 'p2', totalMistakes: 8 },
        { dungeonId: 'd3', playerId: 'p3', totalMistakes: 10 },
      ],
    })

    expect(titles.get('d1')).toBe('The Meat Grinder')
    expect(titles.get('d2')).toBe('The Launch Pad')
    expect(titles.get('d3')).toBe('The Graveyard Shift')
    expect(titles.get('d4')).toBe('The Quiet Lobby')
    expect(new Set(titles.values()).size).toBe(titles.size)
  })

  it('breaks ties with display order', () => {
    const dungeons = [
      makeDungeon('d1', 'Alpha', 5, 0, 1),
      makeDungeon('d2', 'Beta', 5, 0, 2),
    ]

    const titles = assignUniqueDungeonTitles({ allDungeons: dungeons })

    expect(titles.get('d1')).toBe('The Meat Grinder')
    expect(titles.get('d2')).toBe('The Graveyard Shift')
  })
})

describe('getDungeonFlavorTitle', () => {
  it('returns the assigned unique title when the dungeon wins a niche', () => {
    const dungeons = [
      makeDungeon('d1', 'Nexus-Point Xenas', 2, 1, 1),
      makeDungeon('d2', 'Ruby Life Pools', 1, 0, 2),
    ]

    expect(
      getDungeonFlavorTitle({
        dungeon: dungeons[0]!,
        allDungeons: dungeons,
      }).title,
    ).toBe('The Meat Grinder')
  })

  it('includes a tooltip explaining the title', () => {
    const dungeons = [
      makeDungeon('d1', 'Nexus-Point Xenas', 2, 1, 1),
      makeDungeon('d2', 'Ruby Life Pools', 1, 0, 2),
    ]

    expect(
      getDungeonFlavorTitle({
        dungeon: dungeons[0]!,
        allDungeons: dungeons,
      }).tooltip,
    ).toBe('The dungeon with the most total mistakes.')
  })

  it('returns a fallback title when the dungeon does not win a niche', () => {
    const dungeons = [
      makeDungeon('d1', 'Alpha', 8, 2, 1),
      makeDungeon('d2', 'Beta', 0, 10, 2),
      makeDungeon('d3', 'Gamma', 6, 0, 3),
      makeDungeon('d4', 'Delta', 0, 0, 4),
      makeDungeon('d5', 'Epsilon', 1, 2, 5),
      makeDungeon('d6', 'Zeta', 0, 4, 6),
      makeDungeon('d7', 'Eta', 4, 0, 7),
    ]

    expect(
      getDungeonFlavorTitle({
        dungeon: dungeons[4]!,
        allDungeons: dungeons,
      }).title,
    ).toBe('The Gravity Lounge')
  })

  it('returns a clean-record fallback for spotless dungeons that miss the quiet lobby niche', () => {
    const dungeons = [
      makeDungeon('d1', 'Nexus-Point Xenas', 2, 1, 1),
      makeDungeon('d2', 'Ruby Life Pools', 0, 0, 2),
      makeDungeon('d3', 'Skyreach', 0, 0, 3),
    ]

    expect(
      getDungeonFlavorTitle({
        dungeon: dungeons[2]!,
        allDungeons: dungeons,
      }).title,
    ).toBe('The Clean Record')
  })

  it('assigns blame niche titles from dungeon mistake leaders', () => {
    const dungeons = [
      makeDungeon('d1', 'Scapegoat Key', 9, 0, 1),
      makeDungeon('d2', 'Graveyard', 6, 0, 2),
      makeDungeon('d3', 'Launch Pad', 0, 6, 3),
      makeDungeon('d4', 'Committee', 3, 1, 4),
      makeDungeon('d5', 'Blame Magnet', 2, 2, 5),
      makeDungeon('d6', 'Yeet Cannon', 0, 4, 6),
      makeDungeon('d7', 'Floor Lava', 4, 0, 7),
    ]

    const titles = assignUniqueDungeonTitles({
      allDungeons: dungeons,
      dungeonMistakeLeaders: [
        { dungeonId: 'd1', playerId: 'p1', totalMistakes: 9 },
        { dungeonId: 'd2', playerId: 'p2', totalMistakes: 4 },
        { dungeonId: 'd3', playerId: 'p3', totalMistakes: 4 },
        { dungeonId: 'd4', playerId: 'p4', totalMistakes: 2 },
        { dungeonId: 'd5', playerId: 'p5', totalMistakes: 3 },
      ],
    })

    expect(titles.get('d1')).toBe('The Meat Grinder')
    expect(titles.get('d4')).toBe('The Committee Meeting')
    expect(titles.get('d5')).toBe('The Scapegoat Factory')
  })
})
