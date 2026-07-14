import { describe, expect, it } from 'vitest'
import { getPlayerProfile } from './player-characters'

describe('getPlayerProfile', () => {
  it('returns roles and characters for known players', () => {
    expect(getPlayerProfile('Seb')).toEqual({
      roles: ['DPS', 'Healer'],
      characters: [
        { name: 'MostDope', wowClass: 'warlock' },
        { name: 'Nudelkriger', wowClass: 'priest' },
      ],
    })
  })

  it('is case-insensitive', () => {
    expect(getPlayerProfile('martin').roles).toEqual(['DPS', 'Healer', 'Tank'])
  })

  it('falls back for unknown players', () => {
    expect(getPlayerProfile('Guest')).toEqual({
      roles: [],
      characters: [{ name: 'Guest' }],
    })
  })

  it('returns empty data for missing names', () => {
    expect(getPlayerProfile(undefined)).toEqual({ characters: [], roles: [] })
  })
})
