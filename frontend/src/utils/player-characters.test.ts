import { describe, expect, it } from 'vitest'
import { getPlayerProfile, getRegistryPlayerKey } from './player-characters'

describe('getRegistryPlayerKey', () => {
  it('returns registry keys for known display names', () => {
    expect(getRegistryPlayerKey('Seb')).toBe('seb')
    expect(getRegistryPlayerKey('  MARTIN ')).toBe('martin')
  })

  it('returns undefined for unknown or empty names', () => {
    expect(getRegistryPlayerKey('Guest')).toBeUndefined()
    expect(getRegistryPlayerKey('')).toBeUndefined()
    expect(getRegistryPlayerKey(undefined)).toBeUndefined()
  })
})

describe('getPlayerProfile', () => {
  it('returns roles, characters, and playerKey for known players', () => {
    expect(getPlayerProfile('Seb')).toEqual({
      playerKey: 'seb',
      roles: ['DPS', 'Healer'],
      characters: [
        { name: 'MostDope', wowClass: 'warlock' },
        { name: 'Nudelkriger', wowClass: 'priest' },
      ],
    })
  })

  it('is case-insensitive', () => {
    expect(getPlayerProfile('martin').roles).toEqual(['DPS', 'Healer', 'Tank'])
    expect(getPlayerProfile('martin').playerKey).toBe('martin')
  })

  it('falls back for unknown players without a playerKey', () => {
    expect(getPlayerProfile('Guest')).toEqual({
      playerKey: undefined,
      roles: [],
      characters: [{ name: 'Guest' }],
    })
  })

  it('returns empty data for missing names', () => {
    expect(getPlayerProfile(undefined)).toEqual({
      playerKey: undefined,
      characters: [],
      roles: [],
    })
  })
})
