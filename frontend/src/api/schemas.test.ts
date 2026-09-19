import { describe, expect, it } from 'vitest'
import { PlayersResponseSchema } from './schemas'

const validCharacter = {
  id: 'c-1',
  name: 'MostDope',
  realm: null,
  region: null,
  classKey: 'warlock',
  active: true,
  displayOrder: 0,
}

const validPlayer = {
  id: 'p-seb',
  displayName: 'Seb',
  avatarUrl: null,
  characters: [validCharacter],
}

describe('PlayersResponseSchema', () => {
  it('parses a roster with multiple characters', () => {
    const parsed = PlayersResponseSchema.parse({
      players: [
        {
          ...validPlayer,
          characters: [
            validCharacter,
            {
              id: 'c-2',
              name: 'Nudelkriger',
              realm: 'Test Realm',
              region: 'EU',
              classKey: 'priest',
              active: true,
              displayOrder: 1,
            },
          ],
        },
      ],
    })

    expect(parsed.players).toHaveLength(1)
    expect(parsed.players[0]?.characters.map((character) => character.name)).toEqual([
      'MostDope',
      'Nudelkriger',
    ])
    expect(parsed.players[0]?.characters[1]).toEqual({
      id: 'c-2',
      name: 'Nudelkriger',
      realm: 'Test Realm',
      region: 'EU',
      classKey: 'priest',
      active: true,
      displayOrder: 1,
    })
  })

  it('parses empty character arrays and nullable class metadata', () => {
    const parsed = PlayersResponseSchema.parse({
      players: [
        {
          id: 'p-empty',
          displayName: 'Empty',
          avatarUrl: null,
          characters: [],
        },
        {
          id: 'p-null-class',
          displayName: 'NullClass',
          avatarUrl: null,
          characters: [
            {
              id: 'c-null',
              name: 'NoClass',
              realm: null,
              region: null,
              classKey: null,
              active: false,
              displayOrder: 0,
            },
          ],
        },
      ],
    })

    expect(parsed.players[0]?.characters).toEqual([])
    expect(parsed.players[1]?.characters[0]?.classKey).toBeNull()
  })

  it('strips character guid fields from public roster JSON', () => {
    const parsed = PlayersResponseSchema.parse({
      players: [
        {
          ...validPlayer,
          guid: 'Player-1-should-not-leak',
          characters: [
            {
              ...validCharacter,
              guid: 'Player-1-should-not-leak',
            },
          ],
        },
      ],
    })

    expect(JSON.stringify(parsed)).not.toContain('guid')
    expect(JSON.stringify(parsed)).not.toContain('Player-1-should-not-leak')
  })
})
