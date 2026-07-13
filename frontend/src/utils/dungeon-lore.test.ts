import { describe, expect, it } from 'vitest'
import { getDungeonLore } from './dungeon-lore'

describe('getDungeonLore', () => {
  it('returns lore for a known dungeon', () => {
    expect(getDungeonLore({ name: "Magisters' Terrace" })).toContain(
      "Cynosure of Twilight",
    )
  })

  it('returns a fallback for unknown dungeons', () => {
    expect(getDungeonLore({ name: 'Unknown Crypt' })).toContain('season roster')
  })
})
