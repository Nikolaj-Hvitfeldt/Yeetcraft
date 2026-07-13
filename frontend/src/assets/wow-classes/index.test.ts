import { describe, expect, it } from 'vitest'
import { isWowClassKey, wowClasses } from './index'
import { CHARACTERS_BY_PLAYER } from '../../data/player-characters'

describe('wowClasses', () => {
  it('loads all expected class keys', () => {
    const keys = Object.keys(wowClasses).sort()
    expect(keys).toContain('priest')
    expect(keys).toContain('shaman')
    expect(keys).toContain('deathknight')
    expect(keys.length).toBe(13)
  })

  it('maps every configured character class to a loaded icon', () => {
    for (const characters of Object.values(CHARACTERS_BY_PLAYER)) {
      for (const character of characters) {
        if (!character.wowClass) continue
        expect(isWowClassKey(character.wowClass)).toBe(true)
        expect(wowClasses[character.wowClass]).toBeTruthy()
      }
    }
  })
})
