import { describe, expect, it } from 'vitest'
import { classes, isClassKey } from './index'
import { PLAYERS_BY_KEY } from '../../data/player-characters'

describe('classes', () => {
  it('loads all expected class keys', () => {
    const keys = Object.keys(classes).sort()
    expect(keys).toContain('priest')
    expect(keys).toContain('shaman')
    expect(keys).toContain('deathknight')
    expect(keys.length).toBe(13)
  })

  it('maps every configured character class to a loaded icon', () => {
    for (const profile of Object.values(PLAYERS_BY_KEY)) {
      for (const character of profile.characters) {
        if (!character.wowClass) continue
        expect(isClassKey(character.wowClass)).toBe(true)
        expect(classes[character.wowClass]).toBeTruthy()
      }
    }
  })
})
